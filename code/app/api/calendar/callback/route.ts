import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // User denied access or there was an error
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=no_code', request.url)
      )
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code)

      // Redirect back to the app with tokens in URL (for development)
      // In production, you'd want to store these securely
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('auth_success', 'true')
      redirectUrl.searchParams.set('access_token', tokens.access_token || '')
      
      if (tokens.refresh_token) {
        redirectUrl.searchParams.set('refresh_token', tokens.refresh_token)
      }

      // Return HTML page that will close the popup and send message to parent
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authorization Successful</title>
          </head>
          <body>
            <script>
              console.log('Callback page loaded, window.opener:', !!window.opener);
              
              // Send message to parent window
              if (window.opener) {
                const origin = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
                console.log('Sending message to origin:', origin);
                
                const message = {
                  type: 'GOOGLE_AUTH_SUCCESS',
                  accessToken: '${tokens.access_token}',
                  refreshToken: '${tokens.refresh_token || ''}',
                  expiryDate: ${tokens.expiry_date || 'null'}
                };
                
                // Send success message - try with both specific origin and '*'
                try {
                  window.opener.postMessage(message, origin);
                  console.log('Message sent to', origin);
                } catch (e) {
                  console.error('Error sending message:', e);
                  // Try with wildcard as fallback
                  try {
                    window.opener.postMessage(message, '*');
                    console.log('Message sent with wildcard origin');
                  } catch (e2) {
                    console.error('Error sending message with wildcard:', e2);
                  }
                }
                
                // Close the popup after a short delay to ensure message is sent
                setTimeout(() => {
                  try {
                    window.close();
                    console.log('Popup closed');
                  } catch (e) {
                    console.error('Error closing popup:', e);
                    // If close fails, show message to user
                    document.body.innerHTML = '<p style="text-align: center; padding: 20px;">Authorization successful! You can close this window.</p>';
                  }
                }, 500);
              } else {
                console.log('No window.opener, redirecting to main page');
                // If no opener, redirect to main page
                window.location.href = '${redirectUrl.toString()}';
              }
              
              // Send message when popup is about to close (user closes manually)
              window.addEventListener('beforeunload', () => {
                if (window.opener) {
                  const origin = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
                  try {
                    window.opener.postMessage({
                      type: 'GOOGLE_AUTH_CLOSED'
                    }, origin);
                  } catch (e) {
                    // Ignore errors on beforeunload
                  }
                }
              });
            </script>
            <p>Authorization successful! You can close this window.</p>
          </body>
        </html>
      `

      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError)
      return NextResponse.redirect(
        new URL('/?error=token_exchange_failed', request.url)
      )
    }
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/?error=callback_failed', request.url)
    )
  }
}


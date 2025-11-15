import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What file types do you support?',
    answer: 'SyllabiGuy supports PDF, DOC, DOCX files, and common image formats like JPG and PNG. Our AI can extract dates and events from most syllabus formats.',
  },
  {
    question: 'How accurate is the date detection?',
    answer: 'Our AI is highly accurate at detecting dates and event types from syllabi. You always have the chance to review and edit any extracted events before adding them to your calendar.',
  },
  {
    question: 'Do you store my syllabi?',
    answer: 'We temporarily process your syllabi to extract event information, but we do not permanently store your documents. Once events are extracted, the original files are deleted from our servers.',
  },
  {
    question: 'Can I edit events before syncing?',
    answer: 'After we extract events from your syllabus, you can review, edit titles, dates, times, and choose which events to add to your Google Calendar.',
  },
  {
    question: 'Is SyllabiGuy free?',
    answer: 'We offer a free tier that allows you to sync up to 5 syllabi per semester. For unlimited syllabi and advanced features, we offer affordable premium plans.',
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-gradient-to-br from-[oklch(0.95_0.02_350)] to-[oklch(0.95_0.02_250)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about SyllabiGuy
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-2xl px-6 border-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

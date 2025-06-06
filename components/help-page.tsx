"use client"

import { Search, ChevronRight, FileText, MessageCircle, Mail, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions or contact support</p>
      </div>

      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Search for help..." className="pl-10" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentation
            </CardTitle>
            <CardDescription>Browse our comprehensive documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find detailed guides, tutorials, and reference materials to help you get the most out of Budget Tracker.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Documentation
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Community Forum
            </CardTitle>
            <CardDescription>Connect with other users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join our community forum to ask questions, share tips, and learn from other Budget Tracker users.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Visit Forum
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Support
            </CardTitle>
            <CardDescription>Get help from our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need personalized assistance? Our support team is ready to help you with any issues or questions.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Contact Support
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I add a new transaction?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                To add a new transaction, navigate to the Transactions page and click the "Add Transaction" button in
                the top right corner. Fill in the transaction details in the form that appears and click "Add
                Transaction" to save it.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How do I create a new category?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                To create a new category, go to the Categories tab and click the "Add Category" button. Enter the
                category name, select the type (income or expense), choose a parent category if applicable, and pick a
                color. Then click "Add Category" to save it.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>How do I export my data?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                To export your data, go to Settings &gt; Data Management and click the "Export Data" button. This will
                download a JSON file containing all your financial data that you can use as a backup or to import into
                another instance of Budget Tracker.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I set up recurring transactions?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Yes, when adding or editing a transaction, check the "Recurring Transaction" checkbox and select the
                recurrence pattern (daily, weekly, monthly, etc.). The system will track these transactions separately
                and help you manage your regular expenses or income.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How do I set up a budget?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                To set up a budget, navigate to the Budget page and click "Add Budget". Select the category you want to
                budget for, enter the amount, and choose the time period. Your spending in that category will be tracked
                against your budget, and you'll see visual indicators of your progress.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}


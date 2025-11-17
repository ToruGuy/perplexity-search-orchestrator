import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { getTopics, updateTopic } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  query: z.string().min(1, "Query is required").max(1000, "Query is too long"),
  interval: z.enum(["hourly", "daily", "weekly"]),
})

export default function TopicEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      query: "",
      interval: "daily",
    },
  })

  useEffect(() => {
    if (id) loadTopic()
  }, [id])

  const loadTopic = async () => {
    if (!id) return
    try {
      setLoading(true)
      const topics = await getTopics()
      const topic = topics.find((t) => t.id === id)
      if (!topic) {
        toast.error("Topic not found")
        navigate("/")
        return
      }
      form.reset({
        name: topic.name,
        query: topic.query,
        interval: topic.interval,
      })
    } catch (error) {
      toast.error("Failed to load topic")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return
    try {
      setSaving(true)
      await updateTopic({ id, ...values })
      toast.success("Topic updated successfully")
      navigate(`/topics/${id}`)
    } catch (error) {
      toast.error("Failed to update topic")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        to={`/topics/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Topic
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Topic</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AI News" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for this search topic
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Query</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="What are the latest developments in AI this week?"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The query or prompt to send to Perplexity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Interval</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an interval" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How often this search should run automatically
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}


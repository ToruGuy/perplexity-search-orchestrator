import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react"

export default function Settings() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved API key from Tauri backend
    const loadKey = async () => {
      try {
        const savedKey = await invoke<string>("load_api_key")
        setApiKey(savedKey)
        setSaved(true)
      } catch (error) {
        // API key not found - this is fine for first-time users
        console.log("No API key found:", error)
      }
    }
    loadKey()
  }, [])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key")
      return
    }

    if (!apiKey.startsWith("pplx-")) {
      toast.error("Invalid API key format. Perplexity keys start with 'pplx-'")
      return
    }

    setLoading(true)
    try {
      // Save via Tauri backend
      await invoke("save_api_key", { apiKey: apiKey.trim() })
      setSaved(true)
      toast.success("API key saved successfully")
    } catch (error) {
      console.error("Failed to save API key:", error)
      toast.error(`Failed to save API key: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    try {
      await invoke("save_api_key", { apiKey: "" })
      setApiKey("")
      setSaved(false)
      toast.success("API key cleared")
    } catch (error) {
      console.error("Failed to clear API key:", error)
      toast.error("Failed to clear API key")
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Topics
      </Link>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Perplexity API Configuration</CardTitle>
            <CardDescription>
              Enter your Perplexity API key to enable search functionality.
              Get your API key from{" "}
              <a
                href="https://www.perplexity.ai/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                perplexity.ai/settings/api
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={loading || !apiKey.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : saved ? "Update Key" : "Save Key"}
              </Button>
              {saved && (
                <Button variant="outline" onClick={handleClear}>
                  Clear Key
                </Button>
              )}
            </div>

            {saved && (
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ API key configured and ready to use
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Version:</strong> 0.1.0
            </p>
            <p>
              <strong>Model:</strong> Sonar Reasoning (via Perplexity API)
            </p>
            <p>
              This application allows you to schedule and run automated Perplexity
              AI searches at regular intervals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


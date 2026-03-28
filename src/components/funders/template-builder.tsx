"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface TemplateSection {
  id?: string
  name: string
  instructions: string
  word_limit: number | null
  required_fields: string[]
  emphasis_tags: string[]
  order: number
}

interface TemplateBuilderProps {
  funderId: string
  initialSections: TemplateSection[]
}

export function TemplateBuilder({
  funderId,
  initialSections,
}: TemplateBuilderProps) {
  const [sections, setSections] = useState<TemplateSection[]>(
    initialSections.length > 0
      ? initialSections
      : []
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        name: "",
        instructions: "",
        word_limit: null,
        required_fields: [],
        emphasis_tags: [],
        order: prev.length,
      },
    ])
    setSaved(false)
  }

  function removeSection(index: number) {
    setSections((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }))
    )
    setSaved(false)
  }

  function updateSection(index: number, field: string, value: unknown) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/funder-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funder_id: funderId,
          sections: sections.map((s, i) => ({
            name: s.name,
            instructions: s.instructions,
            word_limit: s.word_limit,
            required_fields: s.required_fields,
            emphasis_tags: s.emphasis_tags,
            order: i,
          })),
        }),
      })
      if (res.ok) {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No template sections yet. Add sections to define the reporting
            structure for this funder.
          </p>
        </div>
      ) : (
        sections.map((section, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                  <GripVertical className="size-4" />
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`section-name-${index}`}>
                      Section Name
                    </Label>
                    <Input
                      id={`section-name-${index}`}
                      placeholder="e.g., Executive Summary"
                      value={section.name}
                      onChange={(e) =>
                        updateSection(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`section-instructions-${index}`}>
                      Instructions
                    </Label>
                    <Textarea
                      id={`section-instructions-${index}`}
                      placeholder="Describe what this section should contain..."
                      value={section.instructions}
                      onChange={(e) =>
                        updateSection(index, "instructions", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`section-wordlimit-${index}`}>
                        Word Limit
                      </Label>
                      <Input
                        id={`section-wordlimit-${index}`}
                        type="number"
                        placeholder="e.g., 500"
                        value={section.word_limit ?? ""}
                        onChange={(e) =>
                          updateSection(
                            index,
                            "word_limit",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`section-tags-${index}`}>
                        Emphasis Tags
                      </Label>
                      <Input
                        id={`section-tags-${index}`}
                        placeholder="outcomes, demographics, ..."
                        value={section.emphasis_tags.join(", ")}
                        onChange={(e) =>
                          updateSection(
                            index,
                            "emphasis_tags",
                            e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSection(index)}
                  className="mt-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={addSection}>
          <Plus className="size-4" />
          Add Section
        </Button>
        {sections.length > 0 && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved" : "Save Template"}
          </Button>
        )}
      </div>
    </div>
  )
}

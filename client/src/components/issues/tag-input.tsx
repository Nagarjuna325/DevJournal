import { useState, useEffect, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  initialTags?: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagInput({ initialTags = [], onTagsChange }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  // Update parent component whenever tags change
  useEffect(() => {
    onTagsChange(tags);
  }, [tags, onTagsChange]);

  // Add a new tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle keyboard events (Enter to add tag)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Get badge variant based on tag name
  const getTagVariant = (tagName: string) => {
    const tagNameLower = tagName.toLowerCase();
    if (tagNameLower.includes('react')) return 'react';
    if (tagNameLower.includes('express')) return 'express';
    if (tagNameLower.includes('typescript') || tagNameLower.includes('ts')) return 'typescript';
    if (tagNameLower.includes('database') || tagNameLower.includes('db')) return 'database';
    if (tagNameLower.includes('critical') || tagNameLower.includes('urgent')) return 'critical';
    return 'default';
  };

  return (
    <div>
      <div className="flex items-center">
        <Input 
          type="text" 
          placeholder="Add a tag" 
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 mr-2"
        />
        <Button 
          type="button" 
          variant="secondary"
          onClick={addTag}
        >
          Add
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <Badge 
              key={`${tag}-${index}`} 
              className="flex items-center"
              variant={getTagVariant(tag) as any}
            >
              {tag}
              <button 
                type="button" 
                className="ml-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

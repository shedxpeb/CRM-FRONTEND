'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LinkedModule, TaskCategory } from '../types';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  User,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

interface TaskAdvancedSearchProps {
  onSearch: (query: AdvancedSearchQuery) => void;
  employees: Array<{ id: string; name: string }>;
  tags: string[];
}

export interface AdvancedSearchQuery {
  searchTerm: string;
  searchIn: ('title' | 'description' | 'comments' | 'checklist')[];
  assignedTo?: string;
  tags?: string[];
  linkedModule?: LinkedModule;
  category?: TaskCategory;
  hasImages?: boolean;
  hasAttachments?: boolean;
  hasChecklist?: boolean;
}

const CATEGORIES: TaskCategory[] = ['General', 'Office', 'Field Work', 'Maintenance', 'Installation', 'Inspection', 'Documentation', 'Meeting', 'Training', 'Other'];
const MODULES: LinkedModule[] = ['Leads', 'Customers', 'Projects', 'Estimates', 'Proposals', 'Quotations', 'Invoices', 'Inventory', 'Purchases', 'Finance', 'Documents', 'General'];

export const TaskAdvancedSearch: React.FC<TaskAdvancedSearchProps> = ({
  onSearch,
  employees,
  tags,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIn, setSearchIn] = useState<('title' | 'description' | 'comments' | 'checklist')[]>(['title', 'description']);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [linkedModule, setLinkedModule] = useState<LinkedModule | ''>('');
  const [category, setCategory] = useState<TaskCategory | ''>('');
  const [hasImages, setHasImages] = useState<boolean | undefined>(undefined);
  const [hasAttachments, setHasAttachments] = useState<boolean | undefined>(undefined);
  const [hasChecklist, setHasChecklist] = useState<boolean | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    const query: AdvancedSearchQuery = {
      searchTerm,
      searchIn,
      assignedTo: assignedTo || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      linkedModule: linkedModule || undefined,
      category: category || undefined,
      hasImages,
      hasAttachments,
      hasChecklist,
    };
    onSearch(query);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchIn(['title', 'description']);
    setAssignedTo('');
    setSelectedTags([]);
    setLinkedModule('');
    setCategory('');
    setHasImages(undefined);
    setHasAttachments(undefined);
    setHasChecklist(undefined);
    onSearch({ searchTerm: '', searchIn: ['title', 'description'] });
  };

  const toggleSearchIn = (field: 'title' | 'description' | 'comments' | 'checklist') => {
    setSearchIn(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = () => {
    return searchTerm.length > 0 ||
           assignedTo.length > 0 ||
           selectedTags.length > 0 ||
           linkedModule.length > 0 ||
           category.length > 0 ||
           hasImages !== undefined ||
           hasAttachments !== undefined ||
           hasChecklist !== undefined;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {hasActiveFilters() && (
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search In Options */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-muted-foreground">Search in:</span>
            {(['title', 'description', 'comments', 'checklist'] as const).map(field => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`search-${field}`}
                  checked={searchIn.includes(field)}
                  onCheckedChange={() => toggleSearchIn(field)}
                />
                <Label
                  htmlFor={`search-${field}`}
                  className="text-sm cursor-pointer capitalize"
                >
                  {field}
                </Label>
              </div>
            ))}
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Assigned To */}
                <div className="space-y-2">
                  <Label className="text-sm">Assigned To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any employee</SelectItem>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as TaskCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any category</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Linked Module */}
                <div className="space-y-2">
                  <Label className="text-sm">Linked Module</Label>
                  <Select value={linkedModule} onValueChange={(value) => setLinkedModule(value as LinkedModule)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any module</SelectItem>
                      {MODULES.map(mod => (
                        <SelectItem key={mod} value={mod}>
                          {mod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div className="space-y-2">
                <Label className="text-sm">Quick Filters</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasImages"
                      checked={hasImages === true}
                      onCheckedChange={(checked) => setHasImages(checked === true ? true : undefined)}
                    />
                    <Label htmlFor="hasImages" className="text-sm cursor-pointer">
                      Has Images
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAttachments"
                      checked={hasAttachments === true}
                      onCheckedChange={(checked) => setHasAttachments(checked === true ? true : undefined)}
                    />
                    <Label htmlFor="hasAttachments" className="text-sm cursor-pointer">
                      Has Attachments
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasChecklist"
                      checked={hasChecklist === true}
                      onCheckedChange={(checked) => setHasChecklist(checked === true ? true : undefined)}
                    />
                    <Label htmlFor="hasChecklist" className="text-sm cursor-pointer">
                      Has Checklist
                    </Label>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters() && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Active filters:</span>
                  {assignedTo && (
                    <Badge variant="secondary" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {employees.find(e => e.id === assignedTo)?.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setAssignedTo('')}
                      />
                    </Badge>
                  )}
                  {category && (
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {category}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setCategory('')}
                      />
                    </Badge>
                  )}
                  {linkedModule && (
                    <Badge variant="secondary" className="text-xs">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      {linkedModule}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setLinkedModule('')}
                      />
                    </Badge>
                  )}
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                  {hasImages && (
                    <Badge variant="secondary" className="text-xs">
                      Has Images
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setHasImages(undefined)}
                      />
                    </Badge>
                  )}
                  {hasAttachments && (
                    <Badge variant="secondary" className="text-xs">
                      Has Attachments
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setHasAttachments(undefined)}
                      />
                    </Badge>
                  )}
                  {hasChecklist && (
                    <Badge variant="secondary" className="text-xs">
                      Has Checklist
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setHasChecklist(undefined)}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

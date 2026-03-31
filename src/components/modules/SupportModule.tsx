import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HelpCircle, 
  Upload, 
  X, 
  Send,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface SupportModuleProps {
  userEmail: string;
  onSubmitFeedback: (data: any) => Promise<void>;
}

export const SupportModule: React.FC<SupportModuleProps> = ({
  userEmail,
  onSubmitFeedback
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('bug');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Generate and manage previews
  React.useEffect(() => {
    // Revoke old URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs for current files
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // Cleanup on unmount or when files change
    return () => newUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      
      const oversized = selectedFiles.some(f => f.size > MAX_SIZE);
      if (oversized) {
        toast.error('File too large', {
          description: 'Each image must be smaller than 5MB.'
        });
        return;
      }

      setFiles(prev => [...prev, ...selectedFiles]);
      
      // Reset input value so same file can be selected again if mistakenly removed
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitFeedback({
        subject,
        category,
        content,
        user_email: userEmail,
        files
      });
      toast.success('Feedback submitted successfully!', {
        description: 'Our team will review your request and get back to you.'
      });
      setSubject('');
      setContent('');
      setFiles([]);
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-xl">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Feedback & Support</h2>
        <p className="mt-2 text-zinc-500">Help us make VowVantage even better for your big day.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="rounded-3xl border-none bg-zinc-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-600 shadow-sm">
                <Bug className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Report a Bug</h3>
                <p className="text-xs text-zinc-400">Something not working?</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-3xl border-none bg-zinc-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-600 shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Feature Request</h3>
                <p className="text-xs text-zinc-400">Have a great idea?</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-3xl border-none bg-zinc-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-600 shadow-sm">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">General Question</h3>
                <p className="text-xs text-zinc-400">Need some help?</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Form */}
        <Card className="rounded-3xl border-none bg-white shadow-sm lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>Tell us what's on your mind.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subject</Label>
                  <Input 
                    placeholder="Brief summary..." 
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-zinc-100 bg-zinc-50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="question">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description</Label>
                  <span className={`text-[10px] font-bold ${content.length >= 1000 ? 'text-red-500' : 'text-zinc-400'}`}>
                    {content.length} / 1000
                  </span>
                </div>
                <Textarea 
                  placeholder="Tell us more details..." 
                  className="min-h-[150px] rounded-2xl border-zinc-100 bg-zinc-50 p-4 transition-all focus:bg-white"
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Attachments</Label>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 py-8 text-center transition-colors hover:bg-zinc-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Drag & Drop or Click to Upload</p>
                      <p className="text-xs text-zinc-400">Screenshots or images (Max 5MB each)</p>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {files.map((file, i) => (
                      <div key={i} className="group relative h-20 w-32 overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                        {previewUrls[i] ? (
                          <img 
                            src={previewUrls[i]} 
                            alt={`Preview ${i}`} 
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-zinc-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button 
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100 z-20"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 px-2 text-[8px] text-white truncate font-medium">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-50 px-8 py-6">
              <Button 
                type="submit" 
                className="h-12 w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

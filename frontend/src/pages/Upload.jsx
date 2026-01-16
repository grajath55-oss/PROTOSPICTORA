import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { categories } from '../mockData';

const BACKEND_URL = 'http://localhost:8000';

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price: '29.99',
    orientation: 'landscape',
  });

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: crypto.randomUUID(),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Please login first', variant: 'destructive' });
      return;
    }

    if (!uploadedFiles.length) {
      toast({ title: 'Select at least one image', variant: 'destructive' });
      return;
    }

    if (!formData.title || !formData.category) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);

      for (const img of uploadedFiles) {
        const data = new FormData();
        data.append('file', img.file);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('tags', formData.tags || 'stock');
        data.append('price', Number(formData.price));
        data.append('orientation', formData.orientation);

        const res = await fetch(`${BACKEND_URL}/api/images`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 REQUIRED
          },
          body: data,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Upload failed');
        }
      }

      toast({
        title: 'Upload successful',
        description: `${uploadedFiles.length} image(s) published`,
      });

      setUploadedFiles([]);
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        price: '29.99',
        orientation: 'landscape',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-8">

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Images</CardTitle>
              <CardDescription className="text-gray-400">
                JPG / PNG supported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.id !== 'all').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </CardContent>
          </Card>

          <Button disabled={loading} className="w-full bg-white text-black">
            {loading ? 'Uploading...' : 'Upload & Publish'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Upload;

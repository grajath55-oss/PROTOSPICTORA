import React, { useEffect, useState } from 'react';
import {
  Card, CardContent
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DollarSign, Upload, ShoppingBag, TrendingUp,
  Eye, Heart, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000'; // ✅ explicit backend

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dashboard`);
        const contentType = res.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
          const text = await res.text();
          throw new Error(text);
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError('Backend not reachable or route missing');
      }
    };

    load();
  }, []);

  if (error) return <div className="text-red-500 p-10">{error}</div>;
  if (!data) return <div className="text-white p-10">Loading...</div>;

  const { user, uploads, purchases } = data;

  const stats = [
    { title: 'Total Earnings', value: `$${user.totalEarnings}`, icon: DollarSign },
    { title: 'Images Uploaded', value: user.uploads, icon: Upload },
    { title: 'Total Purchases', value: user.purchases, icon: ShoppingBag },
    { title: 'Balance', value: `$${user.balance}`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4 items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
              <Badge className="mt-2 bg-white text-black">Photographer & Buyer</Badge>
            </div>
          </div>
          <Button onClick={() => navigate('/upload')} className="bg-white text-black">
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(s => (
            <Card key={s.title} className="bg-white/5 border-white/10">
              <CardContent className="flex justify-between items-center pt-6">
                <div>
                  <p className="text-gray-400">{s.title}</p>
                  <h3 className="text-2xl text-white font-bold">{s.value}</h3>
                </div>
                <s.icon className="w-8 h-8 text-white" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="uploads">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {uploads.map(img => (
                <div key={img._id} onClick={() => navigate(`/image/${img._id}`)}>
                  <img src={img.file_url} className="rounded-xl" />
                  <h3 className="text-white mt-2">{img.title}</h3>
                  <div className="flex gap-4 text-gray-400 text-sm">
                    <span><Eye className="inline w-4 h-4" /> {img.downloads}</span>
                    <span><Heart className="inline w-4 h-4" /> {img.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="purchases">
            <div className="space-y-4 mt-6">
              {purchases.map(p => (
                <Card key={p._id} className="bg-white/5 border-white/10">
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">
                        {p.image_ids?.length || 0} images
                      </p>
                      <p className="text-gray-400">${p.total_amount}</p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

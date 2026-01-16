import React, { useEffect, useState } from "react";
import { ShieldAlert, Image, Users, Download, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const BACKEND_URL = "http://localhost:8000";

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ hooks first
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const token = localStorage.getItem("token");

    fetch(`${BACKEND_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, [user]);

  // 🔒 guard after hooks
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <ShieldAlert className="w-14 h-14 mb-4 text-red-400" />
        <h1 className="text-2xl font-bold">Admin Access Only</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat title="Total Images" value={stats.totalImages} icon={<Image />} />
        <Stat title="Total Users" value={stats.totalUsers} icon={<Users />} />
        <Stat title="Downloads" value={stats.totalDownloads} icon={<Download />} />
        <Stat title="Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign />} />
      </div>
    </div>
  );
};

const Stat = ({ title, value, icon }) => (
  <Card className="bg-white/5 border-white/10">
    <CardHeader className="flex flex-row justify-between items-center">
      <CardTitle className="text-sm text-white">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold text-white">{value}</p>
    </CardContent>
  </Card>
);

export default AdminAnalytics;

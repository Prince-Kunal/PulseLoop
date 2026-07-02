"use client";

import { useState } from "react";
import {
  Rss,
  Search,
  Plus,
  Loader2,
  Calendar,
  User,
  Share2,
  CheckCircle2,
  Megaphone,
  Copy,
  Building,
  Image as ImageIcon
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  authorName: string;
  authorRole: string;
  createdAt: string | Date;
}

interface CommunityFeedProps {
  userRole: string;
  userName: string;
  initialPosts: Post[];
}

export default function CommunityFeed({
  userRole,
  userName,
  initialPosts,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Publication states
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });
  
  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const canPublish = userRole === "BLOOD_BANK" || userRole === "ADMIN";

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorName: userName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post");
      }

      setPosts((prev) => [data.post, ...prev]);
      setFormData({ title: "", description: "", imageUrl: "" });
      setShowPublishForm(false);
      setSuccessMsg("Announcent successfully published to the community feed!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit post.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShareAchievement = (achievementText: string, id: string) => {
    navigator.clipboard.writeText(achievementText);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 3000);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Prefilled shareable achievements for donors
  const donorAchievements = [
    {
      id: "ac-1",
      title: "Lifesaver Milestone",
      text: "I just completed another life-saving donation at PulseLoop! Join the network to start saving lives today. ❤️ #PulseLoop #BloodDonor",
      badge: "Life Saver Badge",
    },
    {
      id: "ac-2",
      title: "Current Streak Active",
      text: "Feeling proud! Kept my blood donation streak burning 🔥 on PulseLoop. Ready to answer the next emergency request!",
      badge: "Streak Master Badge",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">PulseLoop Network</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Community Feed</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Stay up-to-date with local blood drives, safety updates, and verified provider announcements.
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowPublishForm(!showPublishForm)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Global Toast Alert */}
      {successMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-2.5 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Share achievements card for donors */}
      {userRole === "DONOR" && (
        <div className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border border-primary/20 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center">
              <Share2 className="h-4 w-4 text-primary mr-1.5" />
              Share Your Achievements
            </h4>
            <p className="text-[11px] text-muted-foreground/90 mt-1">
              Select and copy your prefilled achievements to share your lifesaver journey on social media platforms!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donorAchievements.map((item) => {
              const isCopied = copiedTextId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-primary/10 transition-all"
                >
                  <div className="space-y-1">
                    <span className="inline-flex px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[9px] font-bold">
                      {item.badge}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic pt-1">
                      "{item.text}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleShareAchievement(item.text, item.id)}
                    className="self-end px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-[10px] flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Publish Form modal/drawer */}
      {showPublishForm && (
        <form
          onSubmit={handlePublish}
          className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center">
              <Megaphone className="h-4.5 w-4.5 mr-2 text-primary" />
              New Announcement Details
            </h3>
            <button
              type="button"
              onClick={() => setShowPublishForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Annual Blood Drive at City Plaza Center"
                className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Image URL (Optional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="e.g. https://example.com/drivedemo.jpg"
                className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Announcement Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detail the drive capacity requirements, slots schedules, safety measures, and rewards incentives..."
                className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPublishForm(false)}
              className="px-3.5 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Search Filter and Posts Feed */}
      <div className="space-y-4">
        {/* Search widget */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcement titles, descriptions, or publishers..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        {/* Posts cards feed */}
        {filteredPosts.length === 0 ? (
          <div className="p-10 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs italic">
            No community feed posts matching "{searchQuery}" found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:border-primary/15 transition-all flex flex-col justify-between"
              >
                <div>
                  {post.imageUrl && (
                    <div className="h-44 w-full relative bg-muted flex items-center justify-center text-muted-foreground/45 border-b border-border">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image placeholder
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <ImageIcon className="h-8 w-8 absolute" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="space-y-1.5">
                      <span className="inline-flex px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold">
                        ANNOUNCEMENT
                      </span>
                      <h4 className="text-sm font-extrabold text-foreground leading-tight">
                        {post.title}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-border/60 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center space-x-1.5 font-semibold text-foreground/90">
                    <Megaphone className="h-3.5 w-3.5 text-primary" />
                    <span>{post.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

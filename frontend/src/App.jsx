import React, { useState, useEffect, useContext } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Crown,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  Loader,
  ChevronRight,
  LayoutDashboard,
  SettingsIcon,
  Play,
  MessageCircle,
  TwitterIcon,
  Send,
  InstagramIcon,
  Coins,
  X,
} from "lucide-react";
import AddEpisodeModal from "./components/modals/AddEpisodeModal";

import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import api from "./utils/api";
import Navbar from "./components/Navbar";
import HeroCarousel from "./components/HeroCarousel";
import PlaylistCard from "./components/PlaylistCard";
import AudioPlayer from "./components/AudioPlayer";

// Modal Imports
import LoginModal from "./components/modals/LoginModal";
import ManagePlaylistModal from "./components/modals/ManagePlaylistModal";
import EditProfileModal from "./components/modals/EditProfileModal";
import SubscriptionModal from "./components/modals/SubscriptionModal";
import LogoutModal from "./components/modals/LogoutModal";
import PurchaseOptionsModal from "./components/modals/PurchaseOptionsModal"; // IMPORT THIS

import { loadRazorpay } from "./utils/loadRazorpay";
import MobileBottomNav from "./components/MobileBottomNav";

const PaginatedSection = ({ title, filter, onPlay, onBuy, user }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchItems = async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      const res = await api.get(
        `/audio?filter=${filter}&page=${pageNum}&limit=10`
      );

      const songList = res.data.data || [];
      const newItems = songList.map((song) => ({
        ...song,
        img: song.thumbnail,
      }));

      if (isLoadMore) {
        setItems((prev) => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }
      if (newItems.length < 10 || (res.data.pagination && pageNum >= res.data.pagination.totalPages)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(`Failed to load ${filter} section`, err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [filter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, true);
  };

  if (loading)
    return (
      <div className="py-12 flex justify-center">
        <Loader className="animate-spin text-[#E50914]" />
      </div>
    );
  if (items.length === 0) return null; // Don't show empty sections

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 bg-[#E50914] rounded-full"></div>
        <h2 className="text-2xl font-black text-white">{title}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
        {items.map((p) => (
          <PlaylistCard
            key={p.id}
            item={p}
            onPlay={onPlay}
            onBuy={onBuy}
            user={user}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white border border-gray-700 hover:border-white px-6 py-2 rounded-full transition-all flex items-center gap-2"
          >
            {loadingMore ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              "View More"
            )}
          </button>
        </div>
      )}
    </section>
  );
};

const EditEpisodeModal = ({ isOpen, onClose, episode, onSuccess }) => {
  const [isFree, setIsFree] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (episode) {
      setIsFree(episode.isFree);
    }
  }, [episode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/audio/episode/${episode.id}`, { isFree });
      toast.success("Episode updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#181825] w-full max-w-md p-8 rounded-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Edit Episode</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#121212] p-4 rounded border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-bold">Is Free Episode?</span>
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-5 h-5 accent-red-500" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#E50914] py-3 rounded-xl font-bold text-white hover:bg-red-600 transition-colors">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

const CoinConfirmModal = ({ isOpen, onClose, item, user, onUnlock, onBuyCoins, onSubscribe }) => {
  if (!isOpen || !item) return null;
  const hasCoins = user?.coins > 0;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#181825] w-full max-w-md p-8 rounded-2xl border border-white/10 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
        <div className="w-16 h-16 bg-[#E50914]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#E50914]">
          <Coins size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
        <p className="text-gray-400 text-sm mb-6">"{item.title}" requires 1 Coin to unlock this file for 6 months.</p>
        {hasCoins ? (
          <div className="space-y-4">
            <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
              <p className="text-gray-300">You have <span className="font-bold text-yellow-500">{user.coins} Coins</span></p>
              <p className="text-xs text-gray-500 mt-1">Playing this will consume 1 coin.</p>
            </div>
            <button onClick={() => onUnlock(item)} className="w-full bg-[#E50914] text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
              Unlock for 1 Coin
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#121212] p-4 rounded-xl border border-red-500/30 text-red-400 text-sm">
              You don't have enough coins.
            </div>
            <button onClick={onBuyCoins} className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
              <Coins size={18} /> Buy 10 Coins for ₹99
            </button>
            <button onClick={onSubscribe} className="w-full bg-transparent border border-gray-600 text-white py-3 rounded-xl font-bold hover:bg-white/5 transition-colors">
              View Subscription Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [myLibrary, setMyLibrary] = useState([]);
  const [libraryPage, setLibraryPage] = useState(1);
  const [libraryHasMore, setLibraryHasMore] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryLoadingMore, setLibraryLoadingMore] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);
  const [adminPlaylists, setAdminPlaylists] = useState([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState(499);
  const [newPriceInput, setNewPriceInput] = useState("");
  const {
    user,
    logout,
    setUser,
    loading: authLoading,
  } = useContext(AuthContext);

  const [page, setPage] = useState("home");

  const [playlists, setPlaylists] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [managePlaylistOpen, setManagePlaylistOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [serverSearchResults, setServerSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const [addEpisodeOpen, setAddEpisodeOpen] = useState(false);
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState(null);

  const [editEpisodeOpen, setEditEpisodeOpen] = useState(false);
  const [episodeToEdit, setEpisodeToEdit] = useState(null);

  const [purchaseOptionsOpen, setPurchaseOptionsOpen] = useState(false);
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);

  const fetchLibrary = async (pageNum, isLoadMore = false) => {
    if (!user) return;
    try {
      if (isLoadMore) setLibraryLoadingMore(true);
      else setLoadingLibrary(true);

      const res = await api.get(`/user/library?page=${pageNum}&limit=9`);
      const { items, pagination } = res.data;

      if (isLoadMore) {
        setMyLibrary((prev) => [...prev, ...items]);
      } else {
        setMyLibrary(items);
      }

      setLibraryHasMore(pagination.currentPage < pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch library", err);
    } finally {
      setLoadingLibrary(false);
      setLibraryLoadingMore(false);
    }
  };

  useEffect(() => {
    if (page === "profile" && user) {
      setLibraryPage(1); // Reset page
      fetchLibrary(1, false);
    }
  }, [page, user]);
  const handleLibraryLoadMore = () => {
    const nextPage = libraryPage + 1;
    setLibraryPage(nextPage);
    fetchLibrary(nextPage, true);
  };

  const executeSubscribe = async (subType) => {
    // 'RECURRING' or 'ONE_TIME'
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setPurchaseOptionsOpen(false);
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }
    const typeString =
      subType === "RECURRING"
        ? "SUBSCRIPTION_RECURRING"
        : "SUBSCRIPTION_ONE_TIME";

    try {
      const orderRes = await api.post("/payment/order", { type: typeString });
      const { id: order_id, amount, currency, isRecurring } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: isRecurring ? undefined : amount,
        currency,
        name: "Suno Audiobook Premium",
        description: isRecurring ? "Monthly Auto-Debit" : "1 Month Pass",
        order_id: isRecurring ? undefined : order_id,
        subscription_id: isRecurring ? order_id : undefined,

        prefill: { name: user.name, email: user.email },
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              type: typeString,
            });
            toast.success("Welcome to Premium!");
            window.location.reload();
          } catch (e) {
            toast.error("Verification Failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(
        "Subscription failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleUpgradeClick = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setSelectedItemForPurchase(null);
    setPurchaseOptionsOpen(true);
  };
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await api.get("/payment/price");
        setSubscriptionPrice(res.data.price);
        setNewPriceInput(res.data.price);
      } catch (e) {
        console.error("Price fetch failed", e);
      }
    };
    fetchPrice();
  }, []);

  const handleUpdatePrice = async () => {
    try {
      await api.put("/payment/price", { price: newPriceInput });
      setSubscriptionPrice(newPriceInput);
      toast.success("Subscription Price Updated!");
    } catch (err) {
      toast.error("Failed to update price");
    }
  };

  const executeSinglePurchase = async (item) => {
    setPurchaseOptionsOpen(false);
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Check your internet.");
      return;
    }
    try {
      const orderRes = await api.post("/payment/order", {
        type: "CONTENT_PURCHASE",
        itemId: item.id,
      });
      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Env Variable
        amount,
        currency,
        name: "Purchase Content",
        description: item.title,
        order_id,
        prefill: { name: user.name, email: user.email },
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: "CONTENT_PURCHASE",
              itemId: item.id,
            });
            toast.success("Added to Library!");
            window.location.reload();
          } catch (e) {
            toast.error("Verification Failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(
        "Purchase failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const executeBuyCoins = async () => {
    setCoinModalOpen(false);
    const isLoaded = await loadRazorpay();
    if (!isLoaded) return toast.error("Razorpay SDK failed to load. Check your internet.");
    try {
      const orderRes = await api.post("/payment/order", { type: "BUY_COINS" });
      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Suno Audiobook",
        description: "Buy 10 Coins",
        order_id,
        prefill: { name: user.name, email: user.email },
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: "BUY_COINS",
            });
            toast.success("Coins purchased successfully!");
            window.location.reload();
          } catch (e) {
            toast.error("Verification Failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Coin purchase failed: " + (err.response?.data?.error || err.message));
    }
  };

  const executeUnlockWithCoin = async (item) => {
    try {
      await api.post("/payment/unlock-with-coin", { itemId: item.id });
      toast.success("Unlocked successfully!");
      setCoinModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || "Unlock failed");
    }
  };

  const handleUpgradeSubscription = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load. Check your internet.");
      return;
    }

    try {
      const orderRes = await api.post("/payment/order", {
        type: "SUBSCRIPTION_ONE_TIME",
      });

      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Suno Audiobook Premium",
        description: "1 Month Subscription",
        order_id,
        prefill: { name: user.name, email: user.email }, // Auto-fill user details
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              type: "SUBSCRIPTION_ONE_TIME", // Ensure this matches the order type
            });
            toast.success("Welcome to Premium!");
            window.location.reload();
          } catch (e) {
            console.error(e);
            toast.error("Verification Failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Init Error:", err);
      toast.error(
        "Payment init failed: " + (err.response?.data?.error || err.message)
      );
    }
  };
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/audio?filter=trending&limit=5");
        const songList = res.data.data || [];
        const mapped = songList.map((s) => ({ ...s, img: s.thumbnail }));
        setCarouselItems(mapped);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTrending();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await api.get("/audio?limit=50"); // Fetch larger list for admin
      const songList = res.data.data || [];
      const mapped = songList.map((s) => ({ ...s, img: s.thumbnail }));
      setAdminPlaylists(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (page === "admin" && user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [page, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const res = await api.get(
            `/audio?search=${encodeURIComponent(searchQuery)}`
          );
          const songList = res.data.data || [];
          const mappedResults = songList.map((song) => ({
            ...song,
            category: song.category || (song.isFree ? "Popular" : "Originals"),
            img: song.thumbnail,
          }));

          setServerSearchResults(mappedResults);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setServerSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditEpisodeClick = (ep) => {
    setEpisodeToEdit(ep);
    setEditEpisodeOpen(true);
  };

  const handleEditClick = (playlist) => {
    setEditingPlaylist(playlist); // Set data to pre-fill modal
    setManagePlaylistOpen(true);
  };

  const fetchSongs = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/audio");
      const songList = res.data.data || [];
      const mappedSongs = songList.map((song) => ({
        ...song,
        category: song.category || (song.isFree ? "Popular" : "Originals"),
        img: song.thumbnail,
        audioUrl: song.audioUrl,
      }));
      console.log(res.data);

      setPlaylists(mappedSongs);
    } catch (err) {
      console.error("Failed to load songs", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handlePlay = (item) => {
    const isAdmin = user?.role === "ADMIN";
    const isPremium = user?.isPremium;
    const isOwner = user?.purchasedAudioIds?.some(id => String(id) === String(item.id)) || (item.playlistId && user?.purchasedAudioIds?.some(id => String(id) === String(item.playlistId)));
    const hasFreeEpisodes = item.episodes?.some(ep => ep.isFree);
    const ownsAnyEpisode = item.episodes?.some(ep => user?.purchasedAudioIds?.some(id => String(id) === String(ep.id)));
    const canPlay = isAdmin || isPremium || isOwner || item.isFree || hasFreeEpisodes || ownsAnyEpisode;

    if (canPlay) {
      // Spoof playlist wrapper as free to bypass AudioPlayer's playlist-level lock,
      // ensuring it relies on individual episode locks instead.
      const trackToPlay = { ...item };

      if (isOwner) trackToPlay.isFree = true;

      if (item.episodes) {
        trackToPlay.isFree = true;
        const ownsEntirePlaylist = user?.purchasedAudioIds?.some(id => String(id) === String(item.id));
        trackToPlay.episodes = item.episodes.map(ep => {
          const ownsThisEpisode = ownsEntirePlaylist || user?.purchasedAudioIds?.some(id => String(id) === String(ep.id));
          return ownsThisEpisode ? { ...ep, isFree: true } : ep;
        });
      }

      setCurrentTrack(trackToPlay);
      setIsPlaying(true);
    } else {
      handleBuy(item); // Show purchase modal if locked
    }
  };

  const handleBuy = (item) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setSelectedItemForPurchase(item);
    setCoinModalOpen(true);
  };
  const handleLogoutConfirm = () => {
    logout();
    setLogoutOpen(false);
    setPage("home");
    toast.success("Logged out successfully");
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setUser(updatedData);
      setEditProfileOpen(false);
    } catch (err) {
      toast.error("Update failed");
    }
  };
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // ADMIN: Handle Upload / Update
  const handleSavePlaylist = async (formData, isUpdate, id) => {
    try {
      if (isUpdate && id) {
        await api.put(`/audio/playlist/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Playlist Updated!");
      } else {
        await api.post("/audio/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Upload Successful!");
      }
      setManagePlaylistOpen(false);
      setEditingPlaylist(null);
      fetchSongs();
    } catch (err) {
      toast.error(
        "Operation Failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (
      confirm(
        "Are you sure? This will delete the ENTIRE playlist and all its audio files permanently."
      )
    ) {
      try {
        await api.delete(`/audio/playlist/${id}`);
        toast.success("Playlist Deleted");
        fetchSongs(); // Refresh list
      } catch (err) {
        console.error(err);
        toast.error("Delete failed");
      }
    }
  };

  const handleDeleteEpisode = async (playlistId, episodeId) => {
    if (confirm("Delete this episode? File will be removed.")) {
      try {
        await api.delete(`/audio/episode/${episodeId}`);
        toast.success("Episode Deleted");
        fetchSongs();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete episode");
      }
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  const getFilteredPlaylists = (cat) => {
    if (cat === "Trending") return playlists.slice(0, 5); // Just random logic for demo
    return playlists.filter(
      (p) => p.category === cat || (cat === "Popular" && p.isFree)
    );
  };

  const searchResults = searchQuery
    ? playlists.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const renderContent = () => {
    if (searchQuery) {
      return (
        <div className="max-w-[1400px] mx-auto px-6 pt-12 min-h-[60vh]">
          <h2 className="text-3xl font-black text-white mb-8">
            Search Results "{searchQuery}"
            {isSearching && (
              <Loader className="inline ml-4 animate-spin" size={24} />
            )}
          </h2>

          {!isSearching && serverSearchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {serverSearchResults.map((p) => (
                <PlaylistCard
                  key={p.id}
                  item={p}
                  onPlay={handlePlay}
                  onBuy={handleBuy}
                  user={user}
                />
              ))}
            </div>
          ) : (
            !isSearching && (
              <p className="text-gray-400 text-lg">
                No stories found matching your search.
              </p>
            )
          )}
        </div>
      );
    }

    if (page === "admin") {
      if (user?.role.toLowerCase() !== "admin")
        return <div className="p-20 text-center text-white">Access Denied</div>;

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#E50914] flex items-center gap-2">
                <LayoutDashboard /> Dashboard
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Manage your stories, episodes, and users.
              </p>
            </div>
            <div className="bg-[#181825] border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg">
              <div className="bg-[#E50914]/20 p-2 rounded-lg text-[#E50914]">
                <SettingsIcon size={20} />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase block">
                  Monthly Price (₹)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    className="w-20 bg-[#121212] border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-[#E50914] outline-none"
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(e.target.value)}
                  />
                  <button
                    onClick={handleUpdatePrice}
                    className="bg-white text-black px-3 py-1 rounded text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingPlaylist(null);
                setManagePlaylistOpen(true);
              }}
              className="w-full md:w-auto bg-[#E50914] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Plus size={20} /> Upload Series
            </button>
          </div>
          <div className="hidden md:block bg-[#181825] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-[#121212] text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Title</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {playlists.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-6 flex items-center gap-4">
                        <button
                          onClick={() => toggleRow(p.id)}
                          className="text-gray-500 hover:text-white transition-colors"
                        >
                          {expandedRows[p.id] ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                        <img
                          src={p.thumbnail || "https://placehold.co/40"}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-white text-base">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {p.episodesCount} EPS • {p.category}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${p.isFree
                            ? "bg-green-900/20 text-green-400 border-green-500/30"
                            : "bg-amber-900/20 text-amber-400 border-amber-500/30"
                            }`}
                        >
                          {p.isFree ? "FREE" : `₹${p.price}`}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPlaylistForAdd(p);
                              setAddEpisodeOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                            title="Add Episode"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPlaylist(p);
                              setManagePlaylistOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Edit Metadata"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePlaylist(p.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Series"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[p.id] && (
                      <tr className="bg-[#0f0f16]">
                        <td colSpan="3" className="p-4 pl-16">
                          <div className="bg-[#181825] rounded-xl border border-white/5 p-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>{" "}
                              Episodes
                            </h4>
                            {p.episodes && p.episodes.length > 0 ? (
                              <div className="grid grid-cols-1 gap-2">
                                {p.episodes.map((ep) => (
                                  <div
                                    key={ep.id}
                                    className="flex justify-between items-center bg-[#1e1e2d] p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-gray-500 font-mono text-xs w-6">
                                        #{ep.episodeNumber}
                                      </span>
                                      <span className="text-gray-300 text-sm font-medium">
                                        {ep.title}
                                      </span>
                                      {ep.isFree ? (
                                        <span className="text-[10px] text-green-400 border border-green-500 px-1 rounded ml-2">FREE</span>
                                      ) : (
                                        <span className="text-[10px] text-amber-400 border border-amber-500 px-1 rounded ml-2">PREMIUM</span>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleEditEpisodeClick(ep)} className="text-blue-500/50 hover:text-blue-500 p-2">
                                        <Edit size={16} />
                                      </button>
                                      <button onClick={() => handleDeleteEpisode(p.id, ep.id)} className="text-red-500/50 hover:text-red-500 p-2">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-600 text-sm italic py-2">
                                No episodes uploaded yet.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW (Cards) */}
          <div className="md:hidden space-y-4">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="bg-[#181825] border border-white/10 rounded-2xl p-4 shadow-lg"
              >
                {/* Card Top */}
                <div className="flex gap-4">
                  <img
                    src={p.thumbnail || "https://placehold.co/80"}
                    className="w-20 h-20 rounded-xl object-cover shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">
                      {p.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{p.category}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.isFree
                        ? "bg-green-900/20 text-green-400 border-green-500/30"
                        : "bg-amber-900/20 text-amber-400 border-amber-500/30"
                        }`}
                    >
                      {p.isFree ? "FREE" : `₹${p.price}`}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-4 gap-2 mt-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => toggleRow(p.id)}
                    className={`col-span-1 py-2 rounded-lg flex flex-col items-center justify-center text-xs gap-1 font-medium transition-colors ${expandedRows[p.id]
                      ? "bg-white/10 text-white"
                      : "bg-[#121212] text-gray-400"
                      }`}
                  >
                    {expandedRows[p.id] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}{" "}
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlaylistForAdd(p);
                      setAddEpisodeOpen(true);
                    }}
                    className="col-span-1 bg-[#121212] text-gray-400 hover:text-green-400 py-2 rounded-lg flex flex-col items-center justify-center text-xs gap-1 font-medium"
                  >
                    <Plus size={18} /> Add
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlaylist(p);
                      setManagePlaylistOpen(true);
                    }}
                    className="col-span-1 bg-[#121212] text-gray-400 hover:text-blue-400 py-2 rounded-lg flex flex-col items-center justify-center text-xs gap-1 font-medium"
                  >
                    <Edit size={18} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(p.id)}
                    className="col-span-1 bg-[#121212] text-gray-400 hover:text-red-500 py-2 rounded-lg flex flex-col items-center justify-center text-xs gap-1 font-medium"
                  >
                    <Trash2 size={18} /> Del
                  </button>
                </div>

                {expandedRows[p.id] && (
                  <div className="mt-4 bg-[#121212] rounded-xl p-3 animate-slide-up">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Episodes ({p.episodesCount})
                    </h4>
                    {p.episodes && p.episodes.length > 0 ? (
                      <div className="space-y-2">
                        {p.episodes.map((ep) => (
                          <div
                            key={ep.id}
                            className="flex justify-between items-center bg-[#181825] p-3 rounded-lg border border-white/5"
                          >
                            <div className="truncate pr-2">
                              <span className="text-gray-500 text-xs mr-2">
                                #{ep.episodeNumber}
                              </span>
                              <span className="text-gray-300 text-sm truncate">
                                {ep.title}
                              </span>
                              {ep.isFree ? (
                                <span className="text-[10px] text-green-400 border border-green-500 px-1 rounded ml-2">FREE</span>
                              ) : (
                                <span className="text-[10px] text-amber-400 border border-amber-500 px-1 rounded ml-2">PREMIUM</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditEpisodeClick(ep)} className="text-blue-500/50 hover:text-blue-500 p-2">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteEpisode(p.id, ep.id)} className="text-red-500/50 hover:text-red-500 p-2">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs italic">
                        No episodes.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }


    if (page === "profile") {
      if (!user)
        return (
          <div className="p-20 text-center text-white">Please login first.</div>
        );

      return (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-black text-[#E50914] mb-8">
            My Profile
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* User Info Card */}
            <div className="bg-[#181825] p-8 rounded-2xl border border-white/10 h-fit">
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full border-4 border-[#181825] shadow-2xl bg-gray-800 relative mb-4 ">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      className="w-full h-full object-cover rounded-full"
                      alt="avatar"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#E50914] to-purple-900 flex items-center justify-center text-5xl font-bold text-white rounded-full">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.isPremium && (
                    <div className="absolute -top-20 -right-1  p-1 rounded-bl-lg transform -rotate-11">
                      <Crown size={130} fill="gold" stroke="none" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user.name}
                </h3>
                <p className="text-gray-400 mb-2 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-full mb-6 text-sm font-bold">
                  <Coins size={16} /> {user.coins || 0} Coins
                </div>

                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-gray-600 text-gray-300 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors mb-2"
                >
                  <Edit size={16} /> Edit Profile
                </button>
                <button
                  onClick={() => setSubscriptionOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-gray-600 text-gray-300 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Crown size={16} /> Subscription
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-[#E50914]" /> Purchased
                Library
              </h3>

              {loadingLibrary ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin text-[#E50914]" />
                </div>
              ) : myLibrary.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {myLibrary.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181825] p-4 rounded-xl border border-white/5 hover:border-[#E50914]/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (item.audio.streamUrl) {
                          handlePlay({
                            ...item.audio,
                            id: item.audio.id,
                            title: item.audio.title,
                            artist: item.audio.artist,
                            thumbnail: item.audio.thumbnail,
                            streamUrl: item.audio.streamUrl,
                          });
                        }
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                        <img
                          src={
                            item.audio.thumbnail || "https://placehold.co/200"
                          }
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-[#E50914] p-3 rounded-full">
                            <Play size={20} fill="white" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-white truncate">
                        {item.audio.title}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {item.audio.artist}
                      </p>
                      <div className="mt-2 text-[10px] uppercase font-bold text-green-400 border border-green-500/30 px-2 py-1 rounded inline-block">
                        Purchased
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#181825] rounded-2xl p-10 text-center border border-white/5 border-dashed">
                  <p className="text-gray-400 mb-4">
                    You haven't purchased any premium stories yet.
                  </p>
                  <button
                    onClick={() => setPage("home")}
                    className="text-[#E50914] font-bold hover:underline"
                  >
                    Browse Stories
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (page === "about") {
      return (
        <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-[#E50914] mb-4">
              About Suno Audiobook
            </h1>
            <p className="text-xl text-gray-400">
              The future of immersive audio storytelling.
            </p>
          </div>

          <div className="bg-[#181825] p-8 md:p-12 rounded-3xl border border-white/5 space-y-10 text-gray-300 text-lg leading-relaxed shadow-2xl">
            <section>
              <p>
                Suno Audiobook is an online audiobook platform created to
                deliver engaging, meaningful, and enjoyable audio stories for a
                wide audience. Our focus is on providing a smooth, reliable, and
                easy listening experience through a well-organized digital
                platform.
              </p>
            </section>
            <section>
              <strong className="text-white text-xl block mb-4 border-l-4 border-[#E50914] pl-4">
                Our Vision
              </strong>
              <ul className="list-disc pl-6 space-y-2">
                <li>To make storytelling accessible in audio format.</li>
                <li>To support creativity and originality.</li>
                <li>
                  To build a trusted and user-friendly audiobook platform.
                </li>
              </ul>
            </section>
            <section>
              <strong className="text-white text-xl block mb-4 border-l-4 border-[#E50914] pl-4">
                What We Offer
              </strong>
              <ul className="list-disc pl-6 space-y-2">
                <li>A growing collection of audio stories.</li>
                <li>Free content supported by advertisements.</li>
                <li>Premium paid playlists for uninterrupted listening.</li>
                <li>Content suitable for general audiences.</li>
              </ul>
            </section>
            <section>
              <strong className="text-white text-xl block mb-4 border-l-4 border-[#E50914] pl-4">
                Content & Technology
              </strong>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Some audio content is produced using AI voice technology.
                </li>
                <li>AI voices used do not represent real human narrators.</li>
                <li>All content is original or properly licensed.</li>
                <li>
                  We strictly respect copyright and intellectual property laws.
                </li>
              </ul>
            </section>
            <section>
              <strong className="text-white text-xl block mb-4 border-l-4 border-[#E50914] pl-4">
                Our Values
              </strong>
              <ul className="list-disc pl-6 space-y-2">
                <li>Transparency and ethical content practices.</li>
                <li>Respect for creators and originality.</li>
                <li>Continuous improvement in quality and user experience.</li>
              </ul>
            </section>
            <hr className="border-white/10" />
            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 underline underline-offset-4">
                <a href="https://laxucoder.github.io/Privacy---Policy/" className="hover:underline hover:text-gray-300 transition-colors duration-200 decoration-2 underline-offset-4">Privacy  & Policy</a>
              </h2>
              <p className="mb-4">
                At Suno Audiobook, protecting user privacy is important to us.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  We use cookies to improve website functionality and
                  performance.
                </li>
                <li>
                  Third-party vendors, including Google AdSense, may use cookies
                  to display ads based on user activity.
                </li>
                <li>
                  Data collected is used only for analytics and service
                  improvement.
                </li>
                <li>
                  We do not collect, store, or share sensitive personal or
                  payment information.
                </li>
                <li>
                  Continued use of the website implies acceptance of this
                  policy.
                </li>
              </ul>
            </section>
            <hr className="border-white/10" />
            <section>
              <h2 className="text-2xl font-bold text-blue-400 mb-4 underline underline-offset-4">
                <a href="https://laxucoder.github.io/Terms---Condition/" className="hover:underline hover:text-gray-300 transition-colors duration-200 decoration-2 underline-offset-4">
                  Terms & Conditions
                </a>
              </h2>
              <p className="mb-4">
                By accessing Suno Audiobook, you agree to the following terms:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Content is provided for personal and non-commercial use only.
                </li>
                <li>
                  Paid content must not be copied, shared, or redistributed.
                </li>
                <li>
                  Users must not misuse, damage, or attempt to disrupt the
                  website.
                </li>
                <li>Violation of terms may result in restricted access.</li>
                <li>
                  We reserve the right to update content, services, and policies
                  at any time.
                </li>
              </ul>
            </section>
          </div>
        </div>
      );
    }

    if (page === "support") {
      return (
        <div className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-[#E50914] mb-4">
              Support Center
            </h1>
          </div>

          {/* Content Grid - Responsive: 1 col on mobile, 2 cols on tablet+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column: Contact Info (Your existing code) */}
            <div className="bg-[#181825] p-8 rounded-3xl border border-white/5 shadow-xl hover:border-[#E50914]/30 transition-colors">
              <Phone className="text-[#E50914] mb-6" size={48} />
              <h3 className="text-2xl font-bold text-white mb-4">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-200 bg-white/5 p-4 rounded-xl">
                  <Mail size={24} className="text-[#E50914] flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block text-xs text-gray-500 uppercase font-bold mb-1">
                      Email Us
                    </span>
                    <a
                      href="mailto:panigrahihelp@gmail.com"
                      className="block hover:text-[#E50914] transition-colors truncate"
                    >
                      panigrahihelp@gmail.com
                    </a>
                    <a
                      href="mailto:sunoaudiobookhelp@gmail.com"
                      className="block hover:text-[#E50914] transition-colors truncate"
                    >
                      sunoaudiobookhelp@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Social Media (New Code) */}
            <div className="bg-[#181825] p-8 rounded-3xl border border-white/5 shadow-xl hover:border-[#E50914]/30 transition-colors">
              <MessageCircle className="text-[#E50914] mb-6" size={48} />
              <h3 className="text-2xl font-bold text-blue-400 mb-4 underline underline-offset-4">
                <a href="https://laxucoder.github.io/support/" className="hover:underline hover:text-gray-300 transition-colors duration-200 decoration-2 underline-offset-4">
                  Social Support
                </a>
              </h3>

              <div className="space-y-4">
                {/* X (Formerly Twitter) */}
                <a
                  href="https://x.com/Laxu_kumar_?t=NtFJE9425F_rJtYLVbwYzw&s=09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-200 bg-white/5 p-4 rounded-xl hover:bg-white/10 hover:translate-x-1 transition-all group"
                >
                  {/* Using Twitter icon for X, usually acceptable, or replace with custom SVG */}
                  <TwitterIcon size={24} className="text-[#E50914] group-hover:text-white transition-colors" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold">
                      Follow us on
                    </span>
                    <span className="font-medium">X (Twitter)</span>
                  </div>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/Suno_Audiobook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-200 bg-white/5 p-4 rounded-xl hover:bg-white/10 hover:translate-x-1 transition-all group"
                >
                  <Send size={24} className="text-[#E50914] group-hover:text-white transition-colors" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold">
                      Join Channel
                    </span>
                    <span className="font-medium">Telegram</span>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/audio_series_?igsh=M2x5ajZ5eGkyeWti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-gray-200 bg-white/5 p-4 rounded-xl hover:bg-white/10 hover:translate-x-1 transition-all group"
                >
                  <InstagramIcon size={24} className="text-[#E50914] group-hover:text-white transition-colors" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-bold">
                      Follow us on
                    </span>
                    <span className="font-medium">Instagram</span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      );
    }

    const trendingItems = getFilteredPlaylists("Trending").slice(0, 5); // Get top 5 Trending

    return (
      <div className="pb-24">
        {trendingItems.length > 0 && (
          <HeroCarousel
            items={trendingItems}
            onPlay={handlePlay}
            onBuy={handleBuy}
            user={user}
          />
        )}
        <div className="max-w-350 mx-auto px-6 pt-12 space-y-12">
          <PaginatedSection
            title="Popular Free"
            filter="free"
            onPlay={handlePlay}
            onBuy={handleBuy}
            user={user}
          />
          <PaginatedSection
            title="Premium Originals"
            filter="premium"
            onPlay={handlePlay}
            onBuy={handleBuy}
            user={user}
          />
          <PaginatedSection
            title="Trending Now"
            filter="trending"
            onPlay={handlePlay}
            onBuy={handleBuy}
            user={user}
          />
        </div>
      </div>
    );
  };

  const Section = ({ title, items }) => (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-8 bg-[#E50914] rounded-full"></div>
        <h2 className="text-2xl font-black text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((p) => (
          <PlaylistCard
            key={p.id}
            item={p}
            onPlay={handlePlay}
            onBuy={handleBuy}
            user={user}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] text-[#eee] font-sans selection:bg-[#E50914] selection:text-white">
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar
        activePage={page}
        navigate={setPage}
        user={user}
        onLoginClick={() => setLoginOpen(true)}
        onLogout={() => setLogoutOpen(true)}
        onSearchChange={setSearchQuery}
      />

      <main className="animate-fade-in">{renderContent()}</main>

      <footer className="bg-black py-10 border-t border-gray-900 text-center text-gray-500 text-sm">
        <div className="mb-4 text-[#E50914] font-black text-xl">
          Suno Audiobook
        </div>
        <p>&copy; Copyright 2025 Suno Audiobook. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <button onClick={() => setPage("about")} className="hover:text-white">
            About Us
          </button>
          <button
            onClick={() => setPage("support")}
            className="hover:text-white"
          >
            Support
          </button>
        </div>
      </footer>
      <MobileBottomNav
        activePage={page}
        setPage={setPage}
        user={user}
        onLogin={() => setLoginOpen(true)}
      />

      {/* MODALS */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
      <ManagePlaylistModal
        isOpen={managePlaylistOpen}
        onClose={() => setManagePlaylistOpen(false)}
        onSave={handleSavePlaylist}
        initialData={editingPlaylist}
      />

      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />
      <SubscriptionModal
        isOpen={subscriptionOpen}
        onClose={() => setSubscriptionOpen(false)}
        user={user}
        onUpgrade={handleUpgradeSubscription}
        onUpdateUser={(updatedUser) => setUser(updatedUser)}
        price={subscriptionPrice}
      />
      <EditEpisodeModal
        isOpen={editEpisodeOpen}
        onClose={() => setEditEpisodeOpen(false)}
        episode={episodeToEdit}
        onSuccess={fetchSongs}
      />

      {/* GLOBAL AUDIO PLAYER */}
      <AudioPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        togglePlay={setIsPlaying}
        close={() => {
          setCurrentTrack(null);
          setIsPlaying(false);
        }}
        onRequirePurchase={handleBuy}
        user={user}
      />
      <AddEpisodeModal
        isOpen={addEpisodeOpen}
        onClose={() => setAddEpisodeOpen(false)}
        playlist={selectedPlaylistForAdd}
        onSuccess={fetchSongs}
      />
      <PurchaseOptionsModal
        isOpen={purchaseOptionsOpen}
        onClose={() => setPurchaseOptionsOpen(false)}
        item={selectedItemForPurchase}
        onBuySingle={executeSinglePurchase}
        onSubscribe={executeSubscribe}
        subscriptionPrice={subscriptionPrice}
      />
      <CoinConfirmModal
        isOpen={coinModalOpen}
        onClose={() => setCoinModalOpen(false)}
        item={selectedItemForPurchase}
        user={user}
        onUnlock={executeUnlockWithCoin}
        onBuyCoins={executeBuyCoins}
        onSubscribe={() => { setCoinModalOpen(false); setPurchaseOptionsOpen(true); }}
      />
    </div>
  );
};

export default App;

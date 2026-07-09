export { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";
export {
  getClientAnalytics,
  getClientAuth,
  getClientFirestore,
  getClientStorage,
  getFirebaseApp,
} from "@/lib/firebase/client";
export { subscribeEmail, getAllSubscribers } from "@/lib/firebase/subscribers";
export {
  createNewsArticle,
  deleteNewsArticle,
  getAllNewsArticles,
  getNewsArticle,
  getPublishedNewsArticles,
  seedNewsArticles,
  updateNewsArticle,
} from "@/lib/firebase/news";

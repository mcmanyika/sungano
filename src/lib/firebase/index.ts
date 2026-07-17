export { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";
export {
  getClientAnalytics,
  getClientAuth,
  getClientFirestore,
  getClientStorage,
  getFirebaseApp,
} from "@/lib/firebase/client";
export {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  getPublishedEvents,
  subscribeToPublishedEvents,
  updateEvent,
} from "@/lib/firebase/events";
export { subscribeEmail, getAllSubscribers } from "@/lib/firebase/subscribers";
export {
  deleteVolunteer,
  getAllVolunteers,
  registerVolunteer,
} from "@/lib/firebase/volunteers";
export {
  getDeclaration,
  saveDeclaration,
  subscribeToDeclaration,
} from "@/lib/firebase/declaration";
export {
  getWelcomeVideo,
  saveWelcomeVideo,
  subscribeToWelcomeVideo,
} from "@/lib/firebase/welcome-video";
export {
  createNewsArticle,
  deleteNewsArticle,
  getAllNewsArticles,
  getNewsArticle,
  getPublishedNewsArticle,
  getPublishedNewsArticles,
  incrementNewsArticleViews,
  seedNewsArticles,
  subscribeToPublishedNewsArticles,
  updateNewsArticle,
} from "@/lib/firebase/news";

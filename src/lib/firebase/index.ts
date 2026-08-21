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
  getDefaultSiteNavigation,
  getSiteNavigation,
  saveSiteNavigation,
  subscribeToSiteNavigation,
} from "@/lib/firebase/navigation";
export {
  clearHeroVideo,
  createVideo,
  deleteVideo,
  getAllVideos,
  getPublishedVideos,
  getVideo,
  setHeroVideo,
  subscribeToPublishedHeroVideo,
  subscribeToPublishedVideos,
  updateVideo,
} from "@/lib/firebase/videos";
export {
  createImage,
  deleteImage,
  getAllImages,
  getImage,
  getPublishedImages,
  subscribeToPublishedImages,
  updateImage,
} from "@/lib/firebase/images";
export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  getPublishedProducts,
  setProductPublished,
  subscribeToPublishedProducts,
  updateProduct,
} from "@/lib/firebase/products";
export {
  assertValidGalleryImageFile,
  deleteGalleryImage,
  deleteStoreProductImage,
  uploadGalleryImage,
  uploadStoreProductImage,
} from "@/lib/firebase/storage";
export {
  subscribeToAllDonations,
  subscribeToDonationsByEmail,
} from "@/lib/firebase/donations";
export {
  getDefaultLandingSections,
  getLandingSections,
  saveHeroBannerImage,
  clearHeroBannerImage,
  saveLandingSections,
  setLandingSectionVisible,
  subscribeToLandingSections,
} from "@/lib/firebase/landing-sections";
export { getPartnerProfile, registerPartner } from "@/lib/firebase/partners";
export {
  createComment,
  deleteComment,
  getAllComments,
  setCommentApproved,
  subscribeToAllComments,
  subscribeToApprovedComments,
} from "@/lib/firebase/comments";
export {
  deleteContactMessage,
  setContactStatus,
  submitContactMessage,
  subscribeToContactMessages,
} from "@/lib/firebase/contacts";
export {
  castVote,
  createPoll,
  deletePoll,
  getAllPolls,
  getPoll,
  setPollPublished,
  subscribeToAllPolls,
  subscribeToPublishedPolls,
  updatePoll,
} from "@/lib/firebase/polls";
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

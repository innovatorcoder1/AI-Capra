import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from './components/layout/RootLayout';
import LandingPage from './pages/LandingPage';
import AiChat from './pages/AiChat';
import ChatArena from './pages/ChatArena';
import ImageGeneration from './pages/ImageGeneration';
import VideoGeneration from './pages/VideoGeneration';
import AnalyzeDocuments from './pages/AnalyzeDocuments';
import GenerateDocuments from './pages/GenerateDocuments';
import CareerDevelopment from './pages/CareerDevelopment';
import PsychologicalCounseling from './pages/PsychologicalCounseling';
import Community from './pages/Community';
import Pricing from './pages/Pricing';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/community",
    element: <Community />
  },
  {
    path: "/pricing",
    element: <Pricing />
  },
  {
    element: <RootLayout />,
    children: [
      { path: "dashboard", element: <Navigate to="/chat" replace /> },
      { path: "chat", element: <AiChat /> },
      { path: "chat-arena", element: <ChatArena /> },
      { path: "image-generation", element: <ImageGeneration /> },
      { path: "video-generation", element: <VideoGeneration /> },
      { path: "analyze-documents", element: <AnalyzeDocuments /> },
      { path: "generate-documents", element: <GenerateDocuments /> },
      { path: "career-development", element: <CareerDevelopment /> },
      { path: "psychological-counseling", element: <PsychologicalCounseling /> },
      { path: "library", element: <AiChat /> }
    ]
  }
]);

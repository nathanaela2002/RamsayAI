import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import RecipeDetail from "./pages/RecipeDetail";
import CategoryPage from "./pages/CategoryPage";
import MacrosPage from "./pages/MacrosPage";
import MealPlanPage from "./pages/MealPlanPage";
import MyRecipes from "./pages/MyRecipes";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/macros" element={<MacrosPage />} />
            <Route path="/single-meal" element={<MacrosPage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/myrecipes" element={<MyRecipes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

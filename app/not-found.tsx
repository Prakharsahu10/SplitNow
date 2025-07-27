import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10 py-8">
        {/* Illustration */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Search className="w-16 h-16 text-green-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-white font-bold text-sm">!</span>
          </div>
        </div>

        {/* Error content */}
        <div className="space-y-6 max-w-md mx-auto">
          <div>
            <h1 className="text-8xl md:text-9xl font-bold gradient-title mb-2">
              404
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-teal-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Looks like this expense got lost in the split! The page
              you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          {/* Helpful links */}
          <div className="pt-8 border-t border-gray-200 mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Or try one of these helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/#features"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/groups"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                My Groups
              </Link>
              <Link
                href="/expenses"
                className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Recent Expenses
              </Link>
            </div>
          </div>
        </div>

        {/* Fun statistics or quote */}
        <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">💡 Fun Fact</p>
            <p className="text-gray-700 font-medium">
              &ldquo;Over 50,000 expenses have been successfully split using
              SplitNow!&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="pb-8 text-center">
        <p className="text-xs text-gray-400">
          Error Code: 404 • If you think this is a mistake, please contact
          support
        </p>
      </div>
    </div>
  );
}

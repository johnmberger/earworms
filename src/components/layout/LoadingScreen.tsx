import EarwormLogo from "@/components/layout/EarwormLogo";

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <div
      className={`fixed inset-0 bg-linear-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isLoading}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-br from-purple-500/25 via-pink-500/20 to-red-500/25 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 text-center">
        <EarwormLogo size="lg" className="mx-auto mb-6" />

        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-fade-in">
            earworms
          </h1>
          <p
            className="text-dark-300 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            loading the songs stuck in my head...
          </p>
        </div>
      </div>
    </div>
  );
}

import { LogoMark } from "@/components/layout/LogoMark";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-soft">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="h-10 w-10 animate-pulse" gradientId="amp-mark-app-loading" />
        <div className="w-40 h-[3px] rounded-full bg-line overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-grad-brand animate-[slide_1.2s_ease-in-out_infinite]" />
        </div>
        <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
      </div>
    </div>
  );
}

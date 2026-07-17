import { useSearchParams } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import LogoHeader from "../components/layout/LogoHeader";
import Background from "../components/layout/Background";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const pendingAlumni = searchParams.get("pending") === "alumni";

  return (
    <Background imagePath="/background.webp">
      <div className="min-h-screen flex flex-col">
        <LogoHeader />
        <div className="flex-1 flex items-center  justify-center p-6">
          <div className="w-full max-w-md">
            {/* Card header */}
            <div className="flex items-center gap-2 bg-[#3a2080] px-5 py-3.5 rounded-t-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
              <span className="text-white  font-semibold text-base tracking-wide">
                Alumni Connect
              </span>
            </div>

            {/* Card body */}
            <div className="bg-white rounded-b-lg shadow-lg px-8 py-8">
              {pendingAlumni && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Thanks for registering. Once an administrator approves your
                  alumni account, you can sign in here.
                </div>
              )}
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default LoginPage;

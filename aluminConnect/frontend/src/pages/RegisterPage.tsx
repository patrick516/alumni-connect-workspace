import { useEffect, useState } from "react";
import StudentRegisterForm from "../components/auth/StudentRegisterForm";
import { getBootstrapApi } from "../api/authApi";
import LogoHeader from "../components/layout/LogoHeader";
import Background from "../components/layout/Background";

const CardHeader = () => (
  <div className="flex items-center gap-2 bg-[#27155f] px-5 py-3.5 rounded-t-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
    </svg>
    <span className="text-white font-semibold text-base tracking-wide">
      Alumni Connect
    </span>
  </div>
);

const RegisterPage = () => {
  const [allowFirstAdmin, setAllowFirstAdmin] = useState(false);
  const [bootLoaded, setBootLoaded] = useState(false);

  useEffect(() => {
    getBootstrapApi()
      .then((b) => setAllowFirstAdmin(b.allowFirstAdminRegister))
      .catch(() => setAllowFirstAdmin(false))
      .finally(() => setBootLoaded(true));
  }, []);

  return (
    <Background imagePath="/mzc.webp">
      <div className="min-h-screen flex flex-col">
        <LogoHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <h2 className="text-center text-white font-semibold text-lg mb-3 tracking-wide drop-shadow-lg">
              Registration Centre
            </h2>

            <div className="rounded-lg overflow-hidden shadow-lg">
              <CardHeader />

              <div className="bg-white px-6 py-6">
                <h1 className="text-xl font-bold text-center text-gray-900 mb-5">
                  Join Alumni Connect
                </h1>

                {!bootLoaded ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <StudentRegisterForm allowFirstAdmin={allowFirstAdmin} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default RegisterPage;

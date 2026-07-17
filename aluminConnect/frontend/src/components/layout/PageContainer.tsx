import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

const PageContainer = ({ title, children }: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      {/* On mobile no left margin; on md+ push right of the fixed 256px sidebar */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 p-6 mt-14">{children}</main>
      </div>
    </div>
  );
};

export default PageContainer;

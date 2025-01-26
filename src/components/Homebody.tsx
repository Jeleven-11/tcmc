import Image from "next/image";
import Link from "next/link";

const Homebody = () => {
  return (
    <section className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-blue-900">
            Welcome!
          </h1>
          <p className="text-lg leading-relaxed mb-6">
            Our mission is to serve and protect the community, ensuring safety and justice for all. 
            This platform is your gateway in staying up-to-date with road updates. Want to file a report
            regarding vehicle-related incidents? Click below
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="px-6 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-800 transition duration-200">
                Learn More
            </Link>

            <Link href="/file-report" className="px-6 py-2 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200">
                Report an Issue
              
            </Link>

          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-64 md:h-96">
          <Image
            src="assets/img/pnp.jpg"
            alt="logo"
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </section>
  );
};

export default Homebody;
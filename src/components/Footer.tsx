
export default function Footer()
{
  return (
    <footer className="flex bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Our Mission</h3>
          <p className="text-sm leading-relaxed">
           Sa bagong Pilipinas, ang gusto ng Pulis, LIGTAS KA!
             </p>
        </div>

       
        {/* Contact Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <address className="not-italic space-y-1">
            <p className="text-sm">Tangub City Police Station (TCPS)</p>
            <p className="text-sm">1st St. Juan Luna St.</p>
            <p className="text-sm">Tangub City, Misamis Occidental, 7214</p>
            <p className="text-sm">Phone: 0910 785 9787</p>
            <p className="text-sm">
              Facebook:{" "}
              <a
                href="https://www.facebook.com/tangubccads"
                className="hover:underline text-blue-200"
              >
                Tangub City Police Station
              </a>
            </p>
          </address>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-blue-600 pt-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Tangub City Police Station. All rights reserved.</p>
      </div>
    </footer>
  );
};
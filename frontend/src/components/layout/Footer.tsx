import { Link } from "react-router-dom";
import logo from "../../assets/react.svg";
import BrandLogo from "../common/BrandLogo";
const Footer = () => {
  return (
    <footer className="bg-primary mt-16 border-t border-accent-foreground/70">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="" className="flex items-center">
              <BrandLogo icon={true} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Resources
              </h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <a
                    href="https://developer.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    TMDB API
                  </a>
                </li>
                <li>
                  {/*Update as of 2021: All current versions of major browsers now automatically use the behavior of rel="noopener"*/}
                  <a
                    href="https://www.justwatch.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    JustWatch
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Follow us
              </h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <a
                    href="https://github.com/faivern/streaming-app"
                    target="_blank"
                    className="hover:underline "
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Legal
              </h2>
              <ul className="text-gray-400 font-medium">
                <li className="mb-4">
                  <Link
                    to="/privacy-policy"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />

      </div>
    </footer>
  );
};

export default Footer;

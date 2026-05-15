import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import BrandLogo from "../common/BrandLogo";
const Footer = () => {
  return (
    <footer className="bg-primary mt-16 border-t border-accent-foreground/70 pb-20 md:pb-0">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="" className="flex items-center">
              <BrandLogo icon={true} />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-6">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Resources
              </h2>
              <ul className="text-[var(--subtle)] font-medium">
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
                Legal
              </h2>
              <ul className="text-[var(--subtle)] font-medium">
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
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase">
                Support
              </h2>
              <ul className="text-[var(--subtle)] font-medium">
                <li>
                  <a
                    href="mailto:cinelas.support@gmail.com?subject=Contact"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-[var(--border)] sm:mx-auto lg:my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[var(--subtle)]">
            © {new Date().getFullYear()} Cinelas
          </span>
          <span className="text-xs text-[var(--subtle)] italic select-none">
            Your Personal Cinema Atlas - Explore over a Million Movies & TV Shows
          </span>
          <a
            href="https://buymeacoffee.com/cinelas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--subtle)] hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Heart className="size-3" />
            Support Cinelas
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

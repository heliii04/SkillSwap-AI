import Hero from "../../components/home/Hero";
// import GetStartedTransition from "../../components/home/GetStartedTransition";
import StatsSection from "../../components/home/StatsSection";
import Categories from "../../components/home/Categories";
import WhyChooseUs from "../../components/home/WhyChooseUs";
// import FeaturedMentors from "../../components/home/FeaturedMentors";
import Testinomials from "../../components/home/Testimonials";
import AIRecommendation from "../../components/home/AIRecommendation";
import CTASection from "../../components/home/CTASection";

export default function Home() {
    return (
        <>
            <Hero />
            {/* <GetStartedTransition /> */}
            <StatsSection />
            <Categories />
            <WhyChooseUs />
            {/* <FeaturedMentors /> */}
            <Testinomials />
            <AIRecommendation />
            <CTASection />
        </>
    );
}
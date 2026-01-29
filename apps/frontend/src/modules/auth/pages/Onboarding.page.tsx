import { useNavigate, useSearchParams } from "react-router";
import { OnboardingStep1 } from "../components/OnboardingStep1";
import { OnboardingStep2 } from "../components/OnboardingStep2";
import { OnboardingStep3 } from "../components/OnboardingStep3";

export const OnboardingPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const step = parseInt(searchParams.get("step") || "1", 10);

	const handleBack = () => {
		if (step === 1) {
			navigate("/auth");
		} else {
			navigate(`/auth/onboarding?step=${step - 1}`);
		}
	};

	const handleContinue = () => {
		if (step < 3) {
			navigate(`/auth/onboarding?step=${step + 1}`);
		} else {
			navigate("/auth/login");
		}
	};

	const handleFinish = () => {
		navigate("/auth/login");
	};

	switch (step) {
		case 1:
			return <OnboardingStep1 onBack={handleBack} onContinue={handleContinue} />;
		case 2:
			return <OnboardingStep2 onBack={handleBack} onContinue={handleContinue} />;
		case 3:
			return <OnboardingStep3 onBack={handleBack} onFinish={handleFinish} />;
		default:
			return <OnboardingStep1 onBack={handleBack} onContinue={handleContinue} />;
	}
};

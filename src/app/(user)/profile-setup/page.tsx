"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stepper, isStepperButtonVisible } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/heroui";
import { useSession } from "@/components/providers/SessionProvider";
import { useUser, useCreateOrUpdateUser } from "@/hooks/react-query/user";
import { useAddress, useCreateOrUpdateAddress } from "@/hooks/react-query/address";
import { displayToast } from "@/lib/utils";

import PersonalDataStep from "@/app/(user)/profile-setup/_Components/PersonalDataStep";
import AddressStep from "@/app/(user)/profile-setup/_Components/AddressStep";


import { FaUser, FaMapMarkerAlt } from "react-icons/fa";

const STEPS = [
  { label: "Data Pribadi", value: 0, icon: <FaUser /> },
  { label: "Alamat", value: 1, icon: <FaMapMarkerAlt /> },
];

export interface ProfileFormData {
  full_name: string;
  phone_whatsapp: string;
  emergency_contact: string;
  identity_pict: string;
}

const ProfileSetupPage = () => {
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: addresses, isLoading: addressLoading } = useAddress({ user_id: sessionUser?.id });
  const createOrUpdateUser = useCreateOrUpdateUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    phone_whatsapp: "",
    emergency_contact: "",
    identity_pict: "",
  });

  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  const [stepValidation, setStepValidation] = useState({
    step0: false, // Personal Data
    step1: false, // Address
  });

  // Load existing user data (only on initial load)
  useEffect(() => {
    if (user && !isUserDataLoaded) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        phone_whatsapp: user.phone_whatsapp || "",
        emergency_contact: user.emergency_contact || "",
        identity_pict: user.identity_pict || "",
      }));
      setIsUserDataLoaded(true);
    }
  }, [user, isUserDataLoaded]);

  // Validate steps
  useEffect(() => {
    // Step 0: Personal Data validation
    const step0Valid =
      formData.full_name.trim() !== "" &&
      formData.phone_whatsapp.trim() !== "" &&
      formData.emergency_contact.trim() !== "" &&
      formData.identity_pict !== "";

    // Step 1: Address validation (at least 1 address)
    const step1Valid = (addresses && addresses.length > 0) || false;

    setStepValidation({
      step0: step0Valid,
      step1: step1Valid,
    });
  }, [formData, addresses]);

  // Save current step data to database
  const saveCurrentStepData = async () => {
    try {
      // Only save for step 0 (Personal Data) - other steps save their own data
      if (currentStep === 0) {
        await createOrUpdateUser.mutateAsync({
          id: sessionUser?.id || user?.id,
          email: sessionUser?.email,
          full_name: formData.full_name,
          phone_whatsapp: formData.phone_whatsapp,
          emergency_contact: formData.emergency_contact,
          identity_pict: formData.identity_pict,
        });
      }
    } catch (error) {
      console.error("Failed to save step data:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      await saveCurrentStepData();
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      await saveCurrentStepData();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save all data
      await createOrUpdateUser.mutateAsync({
        id: sessionUser?.id || user?.id,
        email: sessionUser?.email,
        full_name: formData.full_name,
        phone_whatsapp: formData.phone_whatsapp,
        emergency_contact: formData.emergency_contact,
        identity_pict: formData.identity_pict,
      });

      displayToast({
        type: "success",
        title: "Berhasil!",
        description: "Profil Anda telah berhasil dilengkapi",
      });

      // Redirect to profile or catalog
      router.push("/catalog");
    } catch (error) {
      console.error("Failed to save profile:", error);
      displayToast({
        type: "danger",
        title: "Error",
        description: "Gagal menyimpan profil",
      });
    }
  };

  const updateFormData = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const getCurrentStepValidation = () => {
    switch (currentStep) {
      case 0:
        return stepValidation.step0;
      case 1:
        return stepValidation.step1;
      default:
        return false;
    }
  };

  const canProceed = getCurrentStepValidation();
  const isLastStep = currentStep === STEPS.length - 1;
  const buttonVisibility = isStepperButtonVisible(currentStep, STEPS.length);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Lengkapi Profil Anda
          </h1>
          <p className="text-default-600">
            Silakan lengkapi data berikut untuk melanjutkan
          </p>
        </div>

        {/* Stepper Card */}
        <div className="bg-content1 rounded-2xl shadow-lg border border-default-200 overflow-hidden">
          {/* Stepper Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-6 border-b border-default-200">
            <Stepper steps={STEPS} activeStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="p-6 md:p-8 min-h-[400px]">
            {currentStep === 0 && (
              <PersonalDataStep
                formData={formData}
                updateFormData={updateFormData}
                userId={sessionUser?.id || user?.id}
              />
            )}
            {currentStep === 1 && (
              <AddressStep
                userId={sessionUser?.id}
                addresses={addresses || []}
                isLoading={addressLoading}
              />
            )}

          </div>

          {/* Navigation Footer */}
          <div className="bg-default-50 px-6 py-4 border-t border-default-200 flex justify-between items-center">
            <div>
              {buttonVisibility.prev && (
                <Button
                  variant="bordered"
                  onPress={handlePrevious}
                  className="font-medium"
                >
                  Sebelumnya
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {isLastStep ? (
                <>
                  <Button
                    variant="bordered"
                    onPress={handleComplete}
                    className="font-medium"
                  >
                    Skip & Selesai
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleComplete}
                    className="font-medium"
                  >
                    Selesai
                  </Button>
                </>
              ) : (
                <Button
                  color="primary"
                  onPress={handleNext}
                  isDisabled={!canProceed}
                  className="font-medium"
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-4 text-sm text-default-500">
          Step {currentStep + 1} dari {STEPS.length}
        </div>
      </div>
    </main>
  );
};

export default ProfileSetupPage;

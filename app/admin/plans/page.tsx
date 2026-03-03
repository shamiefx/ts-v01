"use client";

import React, { useEffect, useState } from "react";
import { getPlans, type PlanOption } from "../companies/_services/companiesService";
import { PlanCard } from "./_components/PlanCard";
import { SubscribeModal } from "./_components/SubscribeModal";

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        const data = await getPlans();
        setPlans(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-600">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Choose Your Plan</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Select the best plan for your business needs.
        </p>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-zinc-600">No plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Subscribe Modal */}
      {selectedPlan && (
        <SubscribeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import api from "../services/api";
import FatigueCard from "./FatigueCard";

// Mock the API module
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("FatigueCard", () => {
  it("renders loading state initially", () => {
    // Mock a pending promise to keep it in loading state
    (api.get as any).mockReturnValue(new Promise(() => {}));

    render(<FatigueCard />);
    // Check for the spinner or loading container
    // Since the spinner is a div with class animate-spin, we can check for that or the container
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders fatigue data after fetching", async () => {
    const mockData = {
      data: {
        data: {
          status: "fresh",
          riskLevel: 10,
          ctlTrend: 42.5,
          atlTrend: 15.2,
          tsbTrend: 25.8,
          recommendations: ["Reposez-vous bien", "Hydratez-vous"],
        },
      },
    };

    (api.get as any).mockResolvedValue(mockData);

    render(<FatigueCard />);

    await waitFor(() => {
      expect(screen.getByText("Frais")).toBeInTheDocument();
      expect(screen.getByText("Risque: 10%")).toBeInTheDocument();
      expect(screen.getByText("42.50")).toBeInTheDocument(); // CTL rounded
      expect(screen.getByText("15.20")).toBeInTheDocument(); // ATL rounded
      expect(screen.getByText("+25.80")).toBeInTheDocument(); // TSB rounded
    });
  });
});

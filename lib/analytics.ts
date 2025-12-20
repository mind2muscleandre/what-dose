// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "set",
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
      page_path: url,
    })
  }
}

// Predefined event helpers
export const analytics = {
  // User actions
  signUp: (method: string) => {
    trackEvent("sign_up", "user", method)
  },
  signIn: (method: string) => {
    trackEvent("login", "user", method)
  },
  signOut: () => {
    trackEvent("logout", "user")
  },

  // Supplement actions
  searchSupplements: (query: string) => {
    trackEvent("search", "supplements", query)
  },
  viewSupplement: (supplementName: string) => {
    trackEvent("view_item", "supplements", supplementName)
  },
  addToStack: (supplementName: string) => {
    trackEvent("add_to_cart", "supplements", supplementName)
  },
  removeFromStack: (supplementName: string) => {
    trackEvent("remove_from_cart", "supplements", supplementName)
  },

  // Community actions
  viewCommunityStack: (stackId: number) => {
    trackEvent("view_item", "community", `stack_${stackId}`)
  },
  likeStack: (stackId: number) => {
    trackEvent("like", "community", `stack_${stackId}`)
  },
  cloneStack: (stackId: number) => {
    trackEvent("clone", "community", `stack_${stackId}`)
  },
  shareStack: (stackId: number) => {
    trackEvent("share", "community", `stack_${stackId}`)
  },

  // Protocol actions
  viewProtocol: (protocolId: number) => {
    trackEvent("view_item", "protocols", `protocol_${protocolId}`)
  },
  forkProtocol: (protocolId: number) => {
    trackEvent("fork", "protocols", `protocol_${protocolId}`)
  },
  likeProtocol: (protocolId: number) => {
    trackEvent("like", "protocols", `protocol_${protocolId}`)
  },

  // Experiment actions
  createExperiment: (design: string) => {
    trackEvent("create", "experiments", design)
  },
  viewExperiment: (experimentId: number) => {
    trackEvent("view_item", "experiments", `experiment_${experimentId}`)
  },

  // Terra actions
  connectTerra: (provider: string) => {
    trackEvent("connect", "terra", provider)
  },
  disconnectTerra: (provider: string) => {
    trackEvent("disconnect", "terra", provider)
  },

  // Navigation
  navigateTo: (page: string) => {
    trackEvent("page_view", "navigation", page)
  },
}

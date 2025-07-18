import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import type { Organization } from '../types';

interface AppContextType {
  organizations: Organization[];
  activeOrg: Organization | null;
  setActiveOrgById: (orgId: string) => void;
  updateActiveOrg: (updatedOrg: Organization) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with data from the mock service
    const allOrgs = googleSheetsService.getOrganizations();
    setOrganizations(allOrgs);
    if (allOrgs.length > 0) {
        // Set the first organization as the default active one
        setActiveOrg(allOrgs[0]);
    }
    setIsLoading(false);
  }, []);

  const setActiveOrgById = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
        setActiveOrg(org);
    }
  };

  const updateActiveOrg = (updatedOrg: Organization) => {
      // Update in the mock service
      googleSheetsService.updateOrganization(updatedOrg);
      // Update state
      setActiveOrg(updatedOrg);
      setOrganizations(prevOrgs => prevOrgs.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  };

  return (
    <AppContext.Provider value={{ organizations, activeOrg, setActiveOrgById, updateActiveOrg, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ChildrenProvider } from '../contexts/ChildrenContext';
import { DevelopmentProvider } from '../contexts/DevelopmentContext';
import { ContentProvider } from '../contexts/ContentContext';
import { CalendarProvider } from '../contexts/CalendarContext';
import { CommunityProvider } from '../contexts/CommunityContext';

// Componente que encapsula todos os provedores de contexto
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ChildrenProvider>
        <DevelopmentProvider>
          <ContentProvider>
            <CalendarProvider>
              <CommunityProvider>
                {children}
              </CommunityProvider>
            </CalendarProvider>
          </ContentProvider>
        </DevelopmentProvider>
      </ChildrenProvider>
    </AuthProvider>
  );
};

export default AppProviders;

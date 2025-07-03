'use client'
import { createContext, useContext } from 'react';

export const MOCK_PROJECT_ID = '9cdb426d-4087-4a98-afff-843050855a89';

export const ProjectContext = createContext<string>(MOCK_PROJECT_ID);

export const useProjectId = () => useContext(ProjectContext);
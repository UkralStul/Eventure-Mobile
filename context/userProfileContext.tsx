import React, { createContext, useState, ReactNode } from 'react';

interface UserProfileContextProps {
    isBottomSheetOpen: boolean;
    setBottomSheetOpen: (isOpen: boolean) => void;
    selectedUserId: number | null;
    setSelectedUserId: (userId: number | null) => void;
}

const initialContext: UserProfileContextProps = {
    isBottomSheetOpen: false,
    setBottomSheetOpen: () => {},
    selectedUserId: null,
    setSelectedUserId: () => {},
};


export const UserProfileContext = createContext<UserProfileContextProps>(initialContext);

interface UserProfileProviderProps {
    children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
    const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


    return (
        <UserProfileContext.Provider
            value={{
                isBottomSheetOpen,
                setBottomSheetOpen,
                selectedUserId,
                setSelectedUserId,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};
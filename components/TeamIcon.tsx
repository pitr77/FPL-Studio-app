import React from 'react';
import Image from "next/image";
import { TEAM_ICONS } from "../lib/teamIcons";

interface TeamIconProps {
    code: string; // e.g. "ARS"
    alt: string;
    size?: number;
}

export const TeamIcon: React.FC<TeamIconProps> = ({ code, alt, size = 22 }) => {
    const src = TEAM_ICONS[code];

    if (!src) return null;

    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="rounded-full shadow-[0_0_0_1px_rgba(15,23,42,0.85)]"
        />
    );
};

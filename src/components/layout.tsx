import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
    return (
        <main className="flex justify-center h-screen">
            <div className="border-x border-slate-400 h-full w-full md:max-w-2xl overflow-y-scroll no-scrollbar">
                {props.children}
            </div>
        </main>
    );
};
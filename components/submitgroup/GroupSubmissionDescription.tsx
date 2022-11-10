import { FunctionComponent } from "react";
import { Title } from "../Base";
import Image from "next/image";

export const GroupSubmissionDescription: FunctionComponent = () => {
    return (
        <div className="flex h-full justify-center bg-heyanonred text-white">
            <div className="items-center justify-center self-center prose max-w-prose">
                <div className="flex justify-center pt-10">
                    <Image src="/logo.svg" alt="heyanon!" width="174" height="120" />
                </div>

                <div className="px-8">
                    <div className="flex text-center justify-center pb-5">
                        <Title>
                            Create a group with{" "}
                            <a
                                href="https://twitter.com/heyanonxyz"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                @heyanonxyz
                            </a>
                            !
                        </Title>
                    </div>
                </div>
            </div>
        </div>
    );
};
import { Loader } from "@/components/ui";
export default function Loading() {
    return (
        <div style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
            <Loader />
        </div>
    );
}

"use client";
import { Button, Container } from "@/components/ui";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("common");
    return (
        <Container>
            <div style={{ padding: "80px 0", textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem", margin: 0 }}>404</h1>
                <p className="muted">{t("soon")}</p>
                <Link href="/">
                    <Button variant="primary">{t("close")}</Button>
                </Link>
            </div>
        </Container>
    );
}

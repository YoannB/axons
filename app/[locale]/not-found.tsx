"use client";
import { Button, Container, EmptyUniverse } from "@/components/ui";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("notFound");
    return (
        <Container>
            <div className="not-found">
                <EmptyUniverse />
                <h1 className="not-found__code">404</h1>
                <p className="muted">{t("text")}</p>
                <Button variant="primary" href="/">
                    {t("home")}
                </Button>
            </div>
        </Container>
    );
}

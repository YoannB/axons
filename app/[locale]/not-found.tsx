"use client";
import { Button, Container, EmptyUniverse } from "@/components/ui";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const t = useTranslations("notFound");
    return (
        <Container>
            <div className="not-found">
                <EmptyUniverse />
                <h1 className="not-found__code">404</h1>
                <p className="muted">{t("text")}</p>
                <Link href="/">
                    <Button variant="primary">{t("home")}</Button>
                </Link>
            </div>
        </Container>
    );
}

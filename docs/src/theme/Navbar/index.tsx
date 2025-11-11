import React from "react";
import NavbarDefault from "@theme-original/Navbar";
import type NavbarType from "@theme/Navbar";
import type { WrapperProps } from "@docusaurus/types";
import { HealthCheckIndicator } from "../../components/HealthCheckIndicator";
import styles from "./index.module.css";

type Props = WrapperProps<typeof NavbarType>;

export default function NavbarWrapper(props: Props): JSX.Element {
  return (
    <div className={styles.navbarWrapper}>
      <NavbarDefault {...props} />
      <div className={styles.healthIndicatorContainer}>
        <HealthCheckIndicator />
      </div>
    </div>
  );
}


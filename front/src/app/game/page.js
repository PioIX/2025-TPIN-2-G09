import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";

export default function Game(){
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <Order key={Date.now()} />
            </div>
            <div className={styles.section}>
                <Kitchen></Kitchen>
            </div>
        </div>
    );
}


import { TradeEntry } from '@/lib/schemas';

export const checkHardStops = (entry: Partial<TradeEntry>): string[] => {
    const warnings: string[] = [];

    // 1. dango=YES
    if (entry.dango === 'YES') {
        warnings.push('「団子」状態でのエントリーは禁止（優位性が低い）');
    }

    // 2. wavePosition=END かつ emaDistance=LARGE
    if (entry.wavePosition === 'END' && entry.emaDistance === 'LARGE') {
        warnings.push('伸び切り（波動終焉）かつ 25EMA乖離 は高リスク');
    }

    // 3. 月/週/日のうち2つ以上が逆方向
    if (entry.side && entry.higherTF) {
        const { month, week, day } = entry.higherTF;
        const oppositeDir = entry.side === 'BUY' ? 'DOWN' : 'UP';
        let count = 0;
        if (month === oppositeDir) count++;
        if (week === oppositeDir) count++;
        if (day === oppositeDir) count++;

        if (count >= 2) {
            warnings.push(`上位足の抵抗（方向不一致 ${count}/3）に逆らっています`);
        }
    }

    // 4. stopReason が空、または短すぎる（8文字未満）
    if (!entry.stopReason || entry.stopReason.length < 8) {
        warnings.push('損切り根拠が不十分です（8文字以上必須）');
    }

    // 5. rrCategory = LT_1
    if (entry.rrCategory === 'LT_1') {
        warnings.push('リスクリワードが 1:1 未満のエントリーは禁止');
    }

    return warnings;
};

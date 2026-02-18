import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { apiKey, trades } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
あなたは裁量トレーダー向けのトレード分析アシスタントです。
以下のトレードログ（JSON形式）を分析し、ユーザーのトレード改善に役立つレポートを作成してください。

【制約事項】
- 投資助言、売買推奨、将来の価格予測は絶対に行わないでください。
- 「必ず勝てる」といった誤解を招く表現は禁止です。
- 負けパターン、ルールの逸脱、改善に向けた具体的な行動提案に焦点を当ててください。
- 返答は日本語で行ってください。

【出力フォーマット】
1) 今回の総括（3行程度）
2) 負け/逸脱のトップ3パターン
3) “次の10トレードで守るチェックリスト”（箇条書き）
4) ルール改善案（必要なら）
5) 注意：本レポートは投資助言ではありません。

【トレードログ】
${JSON.stringify(trades, null, 2)}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ report: text });
    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}

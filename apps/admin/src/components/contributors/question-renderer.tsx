import { Badge } from "@tada/ui/components/badge";
import { Star, ImageIcon, File, CheckCircle, XCircle } from "lucide-react";

interface QuestionInfo {
  name: string;
  type: string;
  title?: string;
  choices?: Array<{ value: string; text: string }>;
  rateMax?: number;
  columns?: Array<{ value: string; text: string }>;
  rows?: Array<{ value: string; text: string }>;
}

interface QuestionRendererProps {
  question: QuestionInfo;
  answer: any;
}

export function QuestionRenderer({ question, answer }: QuestionRendererProps) {
  const renderAnswer = () => {
    // Extraire la valeur de la réponse
    const value =
      typeof answer === "object" && answer.answer !== undefined
        ? answer.answer
        : answer;

    switch (question.type) {
      case "text":
      case "comment":
        return <TextAnswer value={value} />;

      case "radiogroup":
      case "dropdown":
        return <SingleChoiceAnswer value={value} question={question} />;

      case "checkbox":
      case "tagbox":
        return <MultipleChoiceAnswer value={value} question={question} />;

      case "boolean":
        return <BooleanAnswer value={value} />;

      case "rating":
        return <RatingAnswer value={value} question={question} />;

      case "ranking":
        return <RankingAnswer value={value} question={question} />;

      case "matrix":
        return <MatrixAnswer value={value} question={question} />;

      case "matrixdropdown":
      case "matrixdynamic":
        return <MatrixComplexAnswer value={value} question={question} />;

      case "multipletext":
        return <MultipleTextAnswer value={value} question={question} />;

      case "file":
        return <FileAnswer value={value} />;

      case "image":
      case "imagepicker":
        return <ImageAnswer value={value} question={question} />;

      case "html":
        return <HtmlAnswer value={value} />;

      case "expression":
        return <ExpressionAnswer value={value} />;

      default:
        return <DefaultAnswer value={value} />;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-sm">
            {question.title || question.name}
          </div>
          {/* <Badge variant="outline" className="text-xs">
            {question.type}
          </Badge> */}
        </div>
      </div>
      <div className="mt-3">{renderAnswer()}</div>
    </div>
  );
}

function TextAnswer({ value }: { value: any }) {
  if (!value || value === "")
    return <span className="text-muted-foreground italic">Non renseigné</span>;

  return (
    <div className="bg-background rounded p-2 border">
      <pre className="whitespace-pre-wrap text-sm">{String(value)}</pre>
    </div>
  );
}

function SingleChoiceAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!value)
    return (
      <span className="text-muted-foreground italic">Non sélectionné</span>
    );

  const choice = question.choices?.find((c) => c.value === value);
  const displayText = choice?.text || value;

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <span className="font-medium">{displayText}</span>
    </div>
  );
}

function MultipleChoiceAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!Array.isArray(value) || value.length === 0) {
    return (
      <span className="text-muted-foreground italic">Aucune sélection</span>
    );
  }

  return (
    <div className="space-y-1">
      {value.map((item, index) => {
        const choice = question.choices?.find((c) => c.value === item);
        const displayText = choice?.text || item;
        return (
          <div key={index} className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-sm">{displayText}</span>
          </div>
        );
      })}
    </div>
  );
}

function BooleanAnswer({ value }: { value: any }) {
  const isTrue = value === true || value === "true" || value === 1;

  return (
    <div className="flex items-center gap-2">
      {isTrue ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-700">Oui</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="font-medium text-red-700">Non</span>
        </>
      )}
    </div>
  );
}

function RatingAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Non évalué</span>;
  }

  const rating = Number(value);
  const maxRating = question.rateMax || 5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="font-medium">
        {rating}/{maxRating}
      </span>
    </div>
  );
}

function RankingAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!Array.isArray(value) || value.length === 0) {
    return (
      <span className="text-muted-foreground italic">Aucun classement</span>
    );
  }

  return (
    <div className="space-y-1">
      {value.map((item, index) => {
        const choice = question.choices?.find((c) => c.value === item);
        const displayText = choice?.text || item;
        return (
          <div key={index} className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {index + 1}
            </Badge>
            <span className="text-sm">{displayText}</span>
          </div>
        );
      })}
    </div>
  );
}

function MatrixAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!value || typeof value !== "object") {
    return <span className="text-muted-foreground italic">Aucune réponse</span>;
  }

  return (
    <div className="space-y-2">
      {Object.entries(value).map(([rowKey, columnValue]) => {
        const row = question.rows?.find((r) => r.value === rowKey);
        const column = question.columns?.find((c) => c.value === columnValue);
        const rowText = row?.text || rowKey;
        const columnText = column?.text || String(columnValue);

        return (
          <div
            key={rowKey}
            className="flex items-center justify-between p-2 bg-background rounded border"
          >
            <span className="text-sm font-medium">{rowText}</span>
            <Badge variant="outline">{columnText}</Badge>
          </div>
        );
      })}
    </div>
  );
}

function MatrixComplexAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-muted-foreground italic">Aucune donnée</span>;
  }

  return (
    <div className="space-y-3">
      {value.map((row, index) => (
        <div key={index} className="border rounded p-3 bg-background">
          <div className="font-medium text-sm mb-2">Ligne {index + 1}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(row).map(([key, val]) => (
              <div key={key}>
                <span className="text-muted-foreground">{key}:</span>{" "}
                {String(val)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MultipleTextAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!value || typeof value !== "object") {
    return <span className="text-muted-foreground italic">Aucune réponse</span>;
  }

  return (
    <div className="space-y-2">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="p-2 bg-background rounded border">
          <div className="text-xs text-muted-foreground mb-1">{key}</div>
          <div className="text-sm">{String(val) || "Non renseigné"}</div>
        </div>
      ))}
    </div>
  );
}

function FileAnswer({ value }: { value: any }) {
  if (!value)
    return <span className="text-muted-foreground italic">Aucun fichier</span>;

  const files = Array.isArray(value) ? value : [value];

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 bg-background rounded border"
        >
          <File className="h-4 w-4" />
          <span className="text-sm">
            {file.name || file.content || "Fichier"}
          </span>
          {file.type && (
            <Badge variant="outline" className="text-xs">
              {file.type}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function ImageAnswer({
  value,
  question,
}: {
  value: any;
  question: QuestionInfo;
}) {
  if (!value)
    return <span className="text-muted-foreground italic">Aucune image</span>;

  const images = Array.isArray(value) ? value : [value];

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((img, index) => (
        <div key={index} className="relative">
          {typeof img === "string" && img.startsWith("http") ? (
            <img
              src={img || "/placeholder.svg"}
              alt={`Image ${index + 1}`}
              className="w-full h-20 object-cover rounded"
            />
          ) : (
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">
                {img.text || img.value || "Image"}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function HtmlAnswer({ value }: { value: any }) {
  return (
    <div className="p-2 bg-background rounded border">
      <div className="text-xs text-muted-foreground mb-1">Contenu HTML</div>
      <div className="text-sm font-mono">{String(value)}</div>
    </div>
  );
}

function ExpressionAnswer({ value }: { value: any }) {
  return (
    <div className="p-2 bg-blue-50 rounded border border-blue-200">
      <div className="text-xs text-blue-600 mb-1">Valeur calculée</div>
      <div className="text-sm font-medium">{String(value)}</div>
    </div>
  );
}

function DefaultAnswer({ value }: { value: any }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground italic">Non renseigné</span>;
  }

  return (
    <div className="p-2 bg-background rounded border">
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

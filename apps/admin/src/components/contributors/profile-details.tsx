import { Share, FileText, Users } from "lucide-react";
import { Badge } from "@tada/ui/components/badge";

interface ContributorQuestion {
  key: string;
  question: string;
  type?: string;
  values?: string[];
}

interface ContributorMissionData {
  missionId: string;
  missionName: string;
  missionType?: string;
  questions: ContributorQuestion[];
}

interface ProfileDetailProps {
  contributorData: ContributorMissionData[];
}

const ProfileDetail = ({ contributorData }: ProfileDetailProps) => {
  const totalQuestions = contributorData.reduce((sum, mission) => sum + mission.questions.length, 0);
  const totalMissions = contributorData.length;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="p-6 flex justify-between items-center border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-medium text-gray-800">Profil du contributeur</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalMissions} mission{totalMissions > 1 ? 's' : ''} • {totalQuestions} réponse{totalQuestions > 1 ? 's' : ''}
          </p>
        </div>
        <button className="text-gray-500 hover:text-gray-700" type="button">
          <Share className="h-5 w-5" />
        </button>
      </div>

      {contributorData.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune donnée contributeur disponible</p>
          <p className="text-sm">Les réponses approuvées apparaîtront ici</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {contributorData.map((mission) => (
            <div key={mission.missionId} className="border-b border-gray-50 last:border-b-0">
              {/* Header de mission */}
              <div className="sticky top-0 bg-gray-50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-800">{mission.missionName}</span>
                  {mission.missionType && (
                    <Badge variant="outline" className="text-xs">
                      {mission.missionType}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {mission.questions.length} question{mission.questions.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Questions/Réponses */}
              <div className="divide-y divide-gray-100">
                {mission.questions.map((question, index) => (
                  <div key={`${question.key}-${index}`} className="flex px-6 py-4">
                    <div className="w-2/5 text-gray-600 text-sm leading-relaxed">
                      {question.question}
                      {question.type && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {question.type}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="w-3/5 pl-4">
                      {question.values.length === 1 ? (
                        <div className="text-gray-900 font-medium text-sm leading-relaxed">
                          {question.values[0]}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {question.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                              <span className="text-gray-900 font-medium text-sm leading-relaxed">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileDetail;

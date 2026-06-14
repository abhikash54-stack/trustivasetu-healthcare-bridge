import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  detectTodaysOccasions,
  hasCelebrationBeenShownToday,
  markCelebrationShownToday,
} from '../services/occasionsService';
import { OccasionMatch } from '../types/auth';

interface CelebrationState {
  ready: boolean;
  occasions: OccasionMatch[];
  shouldShow: boolean;
  dismiss: () => void;
}

export function useCelebration(): CelebrationState {
  const user = useSelector((s: RootState) => s.auth.user);
  const [ready, setReady] = useState(false);
  const [occasions, setOccasions] = useState<OccasionMatch[]>([]);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      const found = detectTodaysOccasions(user as any);
      const alreadyShown = found.length > 0 ? await hasCelebrationBeenShownToday(user.id) : false;
      setOccasions(found);
      setShouldShow(found.length > 0 && !alreadyShown);
      setReady(true);
    })();
  }, [user?.id]);

  const dismiss = () => {
    if (user?.id) {
      markCelebrationShownToday(user.id);
    }
    setShouldShow(false);
  };

  return { ready, occasions, shouldShow, dismiss };
}

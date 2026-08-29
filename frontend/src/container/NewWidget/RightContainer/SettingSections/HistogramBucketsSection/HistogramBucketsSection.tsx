import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { InputNumber } from 'antd';
import { Switch } from '@signozhq/ui/switch';
import { Typography } from '@signozhq/ui/typography';

import SettingsSection from '../../components/SettingsSection/SettingsSection';

import './HistogramBucketsSection.styles.scss';

interface HistogramBucketsSectionProps {
	bucketCount: number;
	setBucketCount: Dispatch<SetStateAction<number>>;
	bucketWidth: number;
	setBucketWidth: Dispatch<SetStateAction<number>>;
	combineHistogram: boolean;
	setCombineHistogram: Dispatch<SetStateAction<boolean>>;
}

export default function HistogramBucketsSection({
	bucketCount,
	setBucketCount,
	bucketWidth,
	setBucketWidth,
	combineHistogram,
	setCombineHistogram,
}: HistogramBucketsSectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<SettingsSection title={t('qb_histogram_buckets', { defaultValue: "Histogram / Buckets" })}>
			<section className="histogram-settings__bucket-config control-container">
				<Typography.Text className="section-heading">
					{t('qb_number_of_buckets', { defaultValue: "Number of buckets" })}
				</Typography.Text>
				<InputNumber
					value={bucketCount || null}
					type="number"
					min={0}
					rootClassName="bucket-input"
					placeholder="Default: 30"
					onChange={(val): void => {
						setBucketCount(val || 0);
					}}
				/>
				<Typography.Text className="section-heading histogram-settings__bucket-size-label">
					{t('qb_bucket_width', { defaultValue: "Bucket width" })}
				</Typography.Text>
				<InputNumber
					value={bucketWidth || null}
					type="number"
					precision={2}
					placeholder={t('qb_default_auto', { defaultValue: "Default: Auto" })}
					step={0.1}
					min={0.0}
					rootClassName="histogram-settings__bucket-input"
					onChange={(val): void => {
						setBucketWidth(val || 0);
					}}
				/>
				<section className="histogram-settings__combine-hist">
					<Typography.Text className="section-heading">
						<span className="histogram-settings__merge-label">
							{t('qb_merge_all_series_into', { defaultValue: "Merge all series into one" })}
						</span>
					</Typography.Text>
					<Switch
						value={combineHistogram}
						onChange={(checked): void => setCombineHistogram(checked)}
					/>
				</section>
			</section>
		</SettingsSection>
	);
}
